import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LignePanier {
  id_lignecommande: number;
  id_client: number | null;
  id_maillot: number;
  taille_maillot: string;
  quantite: number;
  prix_ht: number;
  TVA: { taux_tva: number };
  Maillot: {
    id_maillot: number;
    nom_maillot: string;
    url_image_maillot_1: string;
  };
  // … ajoute d’autres champs si nécessaire
}

@Injectable({ providedIn: 'root' })
export class PanierService {
  private apiUrl = 'http://localhost:1992/api/lignecommande';

  constructor(private http: HttpClient) {}

  /** Récupère les lignes de panier pour un client */
  getCartLines(idClient: number): Observable<LignePanier[]> {
    return this.http.get<LignePanier[]>(
      `${this.apiUrl}/client/${idClient}/panier`
    );
  }

  /** Récupère le total TTC du panier pour un client */
  getCartTotal(idClient: number): Observable<{ total: string }> {
    return this.http.get<{ total: string }>(
      `${this.apiUrl}/client/${idClient}/total`
    );
  }

  /** Supprime une ligne du panier */
  removeLine(idLigne: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${idLigne}/client`
    );
  }

  /** Met à jour la quantité ou la taille d’une ligne */
  updateLine(idLigne: number, data: { quantite?: number; taille_maillot?: string }): Observable<LignePanier> {
    return this.http.put<LignePanier>(
      `${this.apiUrl}/${idLigne}`, 
      { data }
    );
  }

  /** Ajoute un article au panier */
  addLine(payload: {
    id_client?: number;
    id_maillot: number;
    taille_maillot: string;
    quantite: number;
    id_tva?: number;
  }): Observable<LignePanier> {
    return this.http.post<LignePanier>(
      `${this.apiUrl}/create`,
      { data: payload }
    );
  }
}

