import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avis } from '../models/avis.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AvisService {
  private baseUrl = `${environment.apiUrl}/avis`;

  /** Récupère tous les avis pour un maillot donné */
  getByMaillot(idMaillot: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.baseUrl}/maillot/${idMaillot}`);
  }

  /** Récupère statistiques (note moyenne, nombre) et avis */
  getStats(idMaillot: number): Observable<{ nombreAvis: number; noteMoyenne: string; avis: Avis[] }> {
    return this.http.get<{ nombreAvis: number; noteMoyenne: string; avis: Avis[] }>(
      `${this.baseUrl}/maillot/${idMaillot}/stats`
    );
  }

  constructor(private http: HttpClient) {}
}