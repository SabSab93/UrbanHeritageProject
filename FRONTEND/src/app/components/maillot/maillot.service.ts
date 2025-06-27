import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Maillot } from '../../models/maillot.model';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class MaillotService {
  private readonly baseUrl = `${environment.apiUrl}/maillot`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Maillot[]> {
    return this.http.get<Maillot[]>(`${this.baseUrl}`);
  }
  getBestSellers(limit = 8): Observable<Maillot[]> {
    return this.http.get<Maillot[]>(`${this.baseUrl}/coup-de-coeur?limit=${limit}`);
  }
  getNewArrivals(limit = 8): Observable<Maillot[]> {
    return this.http.get<Maillot[]>(`${this.baseUrl}/nouveautes?limit=${limit}`);
  }
  getById(id: number): Observable<Maillot> {
    return this.http.get<Maillot>(`${this.baseUrl}/${id}`);
  }
}
