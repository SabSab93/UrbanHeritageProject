// src/app/components/panier/panier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LignePanier } from '../../models/ligne-panier.model';



@Injectable({ providedIn: 'root' })
export class PanierService {
  private apiUrl = 'http://localhost:1992/api/lignecommande';

  constructor(private http: HttpClient) {}

  /** header Authorization si token présent */
  private authOptions() {
    const token = localStorage.getItem('authToken');
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  /** Lignes du panier */
  getCartLines(idClient: number): Observable<LignePanier[]> {
    return this.http.get<LignePanier[]>(
      `${this.apiUrl}/client/${idClient}/panier`,
      this.authOptions()
    );
  }

  /** Total TTC du panier */
  getCartTotal(idClient: number): Observable<{ total: string }> {
    return this.http.get<{ total: string }>(
      `${this.apiUrl}/client/${idClient}/total`,
      this.authOptions()
    );
  }

  /** Supprime une ligne */
  removeLine(idLigne: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${idLigne}/client`,
      this.authOptions()
    );
  }

  /** Met à jour la ligne */
  updateLine(
    idLigne: number,
    data: { quantite?: number; taille_maillot?: string }
  ): Observable<LignePanier> {
    return this.http.put<LignePanier>(
      `${this.apiUrl}/${idLigne}`,
      { data },
      this.authOptions()
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
      { data: payload },
      this.authOptions()
    );
  }
}
