import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { MethodeLivraison } from '../models/methode-livraison.model';
import { LieuLivraison }   from '../models/lieu-livraison.model';
import { Livreur }         from '../models/livreur.model';
import { Reduction }       from '../models/reduction.model';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private readonly baseUrl   = `${environment.apiUrl}/commande`;
  private readonly stripeUrl = `${environment.apiUrl}/stripe`;

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('authToken');
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  getMesCommandes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`, this.authHeaders());
  }

  getCommande(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, this.authHeaders());
  }

  getMethodesLivraison(): Observable<MethodeLivraison[]> {
    return this.http.get<MethodeLivraison[]>(
      `${environment.apiUrl}/methode-livraison`,
      this.authHeaders()
    );
  }

  getLieuxLivraison(): Observable<LieuLivraison[]> {
    return this.http.get<LieuLivraison[]>(
      `${environment.apiUrl}/lieu-livraison`,
      this.authHeaders()
    );
  }

  getLivreurs(): Observable<Livreur[]> {
    return this.http.get<Livreur[]>(
      `${environment.apiUrl}/livreur`,
      this.authHeaders()
    );
  }

  getActiveReductions(): Observable<Reduction[]> {
    return this.http.get<Reduction[]>(
      `${environment.apiUrl}/reduction/public/actives`,
      this.authHeaders()
    );
  }

  /**
   * Finalise la commande + crée la livraison
   */
  finaliserCommande(payload: {
    useClientAddress: boolean;
    adresse_livraison?: string;
    code_postal_livraison?: string;
    ville_livraison?: string;
    pays_livraison?: string;
    id_methode_livraison: number;
    id_lieu_livraison: number;
    id_livreur: number;
  }): Observable<{
    message: string;
    commande: any;
    livraison: any;
  }> {
    return this.http.post<{
      message: string;
      commande: any;
      livraison: any;
    }>(
      `${this.baseUrl}/finaliser`,
      { livraison: payload },
      this.authHeaders()
    );
  }

  /**
   * Crée une session Stripe Checkout et renvoie { url }
   */
  createCheckoutSession(payload: {
    methode: number,
    lieu: number,
    livreur: number,
    useClientAddress: boolean,
    adresse?: string | null,
    code_postal?: string | null,
    ville?: string | null,
    pays?: string | null
  }): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${this.stripeUrl}/create-checkout-session`,
      payload,
      this.authHeaders()
    );
  }
  /**
   * (Optionnel) Récupérer les métadonnées de la session Stripe
   */
  getCheckoutSession(sessionId: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/stripe/session/${sessionId}`,
      this.authHeaders()
    );
  }

  /**
   * (Optionnel) Valider le paiement après redirection
   */
  validerPaiement(idCommande: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/valider-paiement/${idCommande}`,
      {},
      this.authHeaders()
    );
  }

  applyReduction(
    idCommande: number,
    idReduction: number
  ): Observable<{ message: string; link: any }> {
    return this.http.post<{ message: string; link: any }>(
      `${this.baseUrl}/${idCommande}/reduction`,
      { data: { id_reduction: idReduction } },
      this.authHeaders()
    );
  }
    createCheckoutSessionByOrder(idCommande: number): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${this.stripeUrl}/create-checkout-session/${idCommande}`,
      {},
      this.authHeaders()
    );
  }
}

