// src/app/services/artiste.service.ts

import { Injectable } from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Observable }   from 'rxjs';
import { Artiste }      from '../models/artiste.model';

@Injectable({ providedIn: 'root' })
export class ArtisteService {
  private apiUrl = 'http://localhost:1992/api/artiste';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Artiste[]> {
    return this.http.get<Artiste[]>(this.apiUrl);
  }
}
