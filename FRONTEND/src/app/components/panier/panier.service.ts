// src/app/components/panier/panier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LignePanier } from '../../models/ligne-panier.model';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators'; 

@Injectable({ providedIn: 'root' })
export class PanierService {
  private readonly baseUrl = `${environment.apiUrl}/lignecommande`;
  private GUEST_KEY = 'panier_guest';

  private guestLines$ = new BehaviorSubject<LignePanier[]>(this.loadGuest());

  constructor(private http: HttpClient) {}

  /** Auth headers */
  private authOptions() {
    const token = localStorage.getItem('authToken');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  /** LocalStorage → panier invité */
  private loadGuest(): LignePanier[] {
    return JSON.parse(localStorage.getItem(this.GUEST_KEY) || '[]');
  }

  private saveGuest(lines: LignePanier[]) {
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(lines));
    this.guestLines$.next(lines);
  }

  /** Récupère synchroniquement les lignes invitées */
  getGuestLines(): LignePanier[] {
    return this.guestLines$.value;
  }

  /** Vide le panier invité */
  clearGuest(): void {
    this.saveGuest([]);
  }

  /** GET lignes du panier */
  getCartLines(idClient: number | null): Observable<LignePanier[]> {
    if (idClient !== null) {
      return this.http.get<LignePanier[]>(`${this.baseUrl}/client/${idClient}/panier`, this.authOptions());
    } else {
      return this.guestLines$.asObservable();
    }
  }

  /** GET total TTC */
  getCartTotal(idClient: number | null): Observable<{ total: number }> {
    if (idClient !== null) {
      return this.http
        .get<{ total: string }>(`${this.baseUrl}/client/${idClient}/total`, this.authOptions())
        .pipe(
          map(r => {
            // on enlève tout ce qui n'est pas un chiffre ou un point
            const cleaned = r.total.replace(/[^\d\.]/g, '');
            return { total: parseFloat(cleaned) };
          })
        );
    } else {
      // invitation : on renvoie directement un nombre
      const lines = this.guestLines$.value;
      const totalNum = lines.reduce(
        (sum, l) => sum + l.prix_ht * (1 + l.TVA.taux_tva / 100) * l.quantite,
        0
      );
      return of({ total: totalNum });
    }
  }

  /** DELETE une ligne du panier */
  removeLine(idLigne: number, idClient: number | null): Observable<void> {
    if (idClient !== null) {
      return this.http.delete<void>(`${this.baseUrl}/${idLigne}/client`, this.authOptions());
    } else {
      const updated = this.guestLines$.value.filter(l => l.id_lignecommande !== idLigne);
      this.saveGuest(updated);
      return of(undefined);
    }
  }

  /** POST ajout d’une ligne */
  addLine(payload: {
  id_client?: number;
  id_maillot: number;
  taille_maillot: string;
  quantite: number;
  id_tva?: number;
  prix_ht?: number;
  Maillot?: { nom_maillot: string; url_image_maillot_1: string };
  id_personnalisation?: number | null;
  valeur_personnalisation?: string | null;
  couleur_personnalisation?: string | null;
}): Observable<LignePanier> {
  if (payload.id_client != null) {
    return this.http.post<LignePanier>(
      `${this.baseUrl}/create`,
      { data: payload },
      this.authOptions()
    );
  } else {
    const ligne: LignePanier = {
      id_lignecommande: Date.now(),
      id_client: null,
      id_maillot: payload.id_maillot,
      taille_maillot: payload.taille_maillot,
      quantite: payload.quantite,
      prix_ht: payload.prix_ht || 0,
      TVA: { taux_tva: 20 },
      Maillot: {
        // On réinjecte l'id ici
        id_maillot: payload.id_maillot,
        nom_maillot: payload.Maillot?.nom_maillot || 'Maillot invité',
        url_image_maillot_1: payload.Maillot?.url_image_maillot_1 || ''
      },
      id_personnalisation: payload.id_personnalisation ?? undefined,
      valeur_personnalisation: payload.valeur_personnalisation ?? undefined,
      couleur_personnalisation: payload.couleur_personnalisation ?? undefined
    };
    const updated = [...this.guestLines$.value, ligne];
    this.saveGuest(updated);
    return of(ligne);
  }
}

  /** PUT mise à jour d’une ligne */
  updateLine(
    idLigne: number,
    data: { quantite?: number; taille_maillot?: string },
    idClient: number | null
  ): Observable<LignePanier> {
    if (idClient !== null) {
      return this.http.put<LignePanier>(
        `${this.baseUrl}/${idLigne}`,
        { data },
        this.authOptions()
      );
    } else {
      const updated = this.guestLines$.value.map(l =>
        l.id_lignecommande === idLigne ? { ...l, ...data } : l
      );
      this.saveGuest(updated);
      return of(updated.find(l => l.id_lignecommande === idLigne)!);
    }
  }
}
