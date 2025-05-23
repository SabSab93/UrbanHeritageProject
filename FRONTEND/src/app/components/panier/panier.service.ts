// src/app/components/panier/panier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LignePanier } from '../../models/ligne-panier.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PanierService {
  private readonly baseUrl = `${environment.apiUrl}/lignecommande`;
  private readonly GUEST_KEY = 'panier_guest';

  private guestLines$ = new BehaviorSubject<LignePanier[]>(this.loadGuest());

  constructor(private http: HttpClient) {}

  /* ---------- utils auth ---------- */
  private authOptions() {
    const token = localStorage.getItem('authToken');
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  /* ---------- localStorage invités ---------- */
  private loadGuest(): LignePanier[] {
    return JSON.parse(localStorage.getItem(this.GUEST_KEY) || '[]');
  }
  private saveGuest(lines: LignePanier[]) {
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(lines));
    this.guestLines$.next(lines);
  }

  getGuestLines(): LignePanier[] {
    return this.guestLines$.value;
  }
  clearGuest(): void {
    this.saveGuest([]);
  }

  /* ---------- API panier ---------- */
  getCartLines(idClient: number | null): Observable<LignePanier[]> {
    return idClient !== null
      ? this.http.get<LignePanier[]>(
          `${this.baseUrl}/client/${idClient}/panier`,
          this.authOptions()
        )
      : this.guestLines$.asObservable();
  }

  getCartTotal(idClient: number | null): Observable<{ total: number }> {
    if (idClient !== null) {
      return this.http
        .get<{ total: string }>(
          `${this.baseUrl}/client/${idClient}/total`,
          this.authOptions()
        )
        .pipe(
          map(r => ({
            total: parseFloat(r.total.replace(/[^\d.]/g, '')),
          }))
        );
    } else {
      const tot = this.guestLines$.value.reduce(
        (s, l) => s + l.prix_ht * (1 + l.TVA.taux_tva / 100) * l.quantite,
        0
      );
      return of({ total: tot });
    }
  }

  /* ---------- supprimer / mettre à jour ---------- */
  removeLine(idClient: number | null, idLigne: number): Observable<void> {
    if (idClient !== null) {
      return this.http.delete<void>(
        `${this.baseUrl}/${idLigne}/client`,
        this.authOptions()
      );
    } else {
      const updated = this.guestLines$.value.filter(
        l => l.id_lignecommande !== idLigne
      );
      this.saveGuest(updated);
      return of(undefined);
    }
  }

  updateLine(
    idClient: number | null,
    idLigne: number,
    data: { quantite?: number; taille_maillot?: string }
  ): Observable<LignePanier> {
    if (idClient !== null) {
      return this.http.put<LignePanier>(
        `${this.baseUrl}/${idLigne}`,
        { data },
        this.authOptions()
      );
    } else {
      const updatedArr = this.guestLines$.value.map(l =>
        l.id_lignecommande === idLigne ? { ...l, ...data } : l
      );
      this.saveGuest(updatedArr);
      return of(updatedArr.find(l => l.id_lignecommande === idLigne)!);
    }
  }

  /* ---------- ajouter ---------- */
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
          id_maillot: payload.id_maillot,
          nom_maillot: payload.Maillot?.nom_maillot || 'Maillot invité',
          url_image_maillot_1:
            payload.Maillot?.url_image_maillot_1 || '',
        },
        id_personnalisation: payload.id_personnalisation ?? undefined,
        valeur_personnalisation:
          payload.valeur_personnalisation ?? undefined,
        couleur_personnalisation:
          payload.couleur_personnalisation ?? undefined,
      };
      this.saveGuest([...this.guestLines$.value, ligne]);
      return of(ligne);
    }
  }
}
