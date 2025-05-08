// src/app/maillot/maillot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Maillot } from '../models/maillot.model';


@Injectable({ providedIn: 'root' })
export class MaillotService {
  private apiUrl = 'http://localhost:1992/api/maillot';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Maillot[]> {
    return this.http.get<Maillot[]>(`${this.apiUrl}`);
  }
  getBestSellers(limit = 8): Observable<Maillot[]> {
    return this.http.get<Maillot[]>(`${this.apiUrl}/coup-de-coeur?limit=${limit}`);
  }
  getNewArrivals(limit = 8): Observable<Maillot[]> {
    return this.http.get<Maillot[]>(`${this.apiUrl}/nouveautes?limit=${limit}`);
  }
  getById(id: number): Observable<Maillot> {
    return this.http.get<Maillot>(`${this.apiUrl}/${id}`);
  }
}
