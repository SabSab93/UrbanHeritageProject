import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LignePanier } from '../../models/ligne-panier.model';
import { Client } from '../../models/client.model';

@Injectable({ providedIn: 'root' })
export class PanierService {
  private apiUrl = 'http://localhost:1992/api/lignecommande';
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

  /** GET lignes du panier */
  getCartLines(idClient: number | null): Observable<LignePanier[]> {
    if (idClient !== null) {
      return this.http.get<LignePanier[]>(`${this.apiUrl}/client/${idClient}/panier`, this.authOptions());
    } else {
      return this.guestLines$.asObservable();
    }
  }

  /** GET total TTC */
  getCartTotal(idClient: number | null): Observable<{ total: string }> {
    if (idClient !== null) {
      return this.http.get<{ total: string }>(`${this.apiUrl}/client/${idClient}/total`, this.authOptions());
    } else {
      const lines = this.guestLines$.value;
      const total = lines
        .reduce((sum, l) => sum + l.prix_ht * (1 + l.TVA.taux_tva / 100) * l.quantite, 0)
        .toFixed(2);
      return of({ total });
    }
  }

  /** DELETE une ligne du panier */
removeLine(idLigne: number, idClient: number | null): Observable<void> {
  if (idClient !== null) {
    // suppression côté serveur
    return this.http.delete<void>(`${this.apiUrl}/${idLigne}/client`, this.authOptions());
  } else {
    // suppression côté invité (localStorage)
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
  }): Observable<LignePanier> {
    if (payload.id_client !== undefined && payload.id_client !== null) {
      return this.http.post<LignePanier>(`${this.apiUrl}/create`, { data: payload }, this.authOptions());
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
          url_image_maillot_1: payload.Maillot?.url_image_maillot_1 || ''
        }
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
      return this.http.put<LignePanier>(`${this.apiUrl}/${idLigne}`, { data }, this.authOptions());
    } else {
      const updated = this.guestLines$.value.map(l =>
        l.id_lignecommande === idLigne ? { ...l, ...data } : l
      );
      this.saveGuest(updated);
      return of(updated.find(l => l.id_lignecommande === idLigne)!);
    }
  }
}
