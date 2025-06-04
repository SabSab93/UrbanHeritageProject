// src/app/services/artiste.service.ts

import { Injectable } from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { map, Observable }   from 'rxjs';
import { Artiste }      from '../../models/artiste.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArtisteService {
  private readonly baseUrl = `${environment.apiUrl}/artiste`;
  

  constructor(private http: HttpClient) {}

  getAll(): Observable<Artiste[]> {
    return this.http.get<Artiste[]>(this.baseUrl);
  }
  getById(id: number): Observable<Artiste> {
    return this.http
      .get<any>(`${this.baseUrl}/${id}`)   
      .pipe(
        map(res => {
          const maillots = res.Maillots ?? [];
          delete res.Maillots;
          return { ...res, maillots } as Artiste;
        })
      );
  }
}