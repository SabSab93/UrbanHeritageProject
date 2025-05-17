// src/app/services/commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Commande } from '../models/commande.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private readonly baseUrl = `${environment.apiUrl}/commande`;



  constructor(private http: HttpClient) {}

  /** Récupère toutes les commandes du client */
  getMesCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.baseUrl}`);
  }

  /** Détail d’une commande par ID */
  getCommande(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.baseUrl}/${id}`);
  }
}
