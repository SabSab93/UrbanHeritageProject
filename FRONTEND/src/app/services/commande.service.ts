// src/app/services/commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Commande } from '../models/commande.model';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private base = 'http://localhost:1992/api/commande';

  constructor(private http: HttpClient) {}

  /** Récupère toutes les commandes du client */
  getMesCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.base}`);
  }

  /** Détail d’une commande par ID */
  getCommande(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.base}/${id}`);
  }
}
