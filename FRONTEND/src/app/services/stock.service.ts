// src/app/services/stock.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


export interface Disponibilite {
  taille_maillot: string;
  quantite_disponible: number;
  statut: string;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  constructor(private http: HttpClient) {}

  /** Renvoie la dispo par taille pour un maillot (front) */
  getDisponibilitePublic(idMaillot: number) {
    return this.http.get<Disponibilite[]>(
      `${environment.apiUrl}/stock/public/disponibilite/${idMaillot}`
    );
  }
}
