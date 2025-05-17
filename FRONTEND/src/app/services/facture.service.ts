// src/app/services/facture.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facture }   from '../models/facture.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FactureService {
  private readonly baseUrl = `${environment.apiUrl}/facture`;

  constructor(private http: HttpClient) {}

  /** Récupère la liste des factures du client connecté */
  getMesFactures(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.baseUrl}`);
  }

  /** Télécharge (et envoie par mail) la facture au format PDF */
downloadFacture(numero: string): Observable<Blob> {
  return this.http.get(
    `${this.baseUrl}/download/${numero}`,
    {
      responseType: 'blob',
      headers: { 'Accept': 'application/pdf' }
    }
  );
  }
}
