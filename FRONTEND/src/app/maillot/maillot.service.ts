// src/app/maillot/maillot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Maillot {
  id_maillot: number;
  nom_maillot: string;
  pays_maillot: string;
  description_maillot: string;
  url_image_maillot_1: string;
  url_image_maillot_2?: string;
  url_image_maillot_3?: string;
  prix_ht_maillot: number;
}

@Injectable({ providedIn: 'root' })
export class MaillotService {
  private baseUrl = 'http://localhost:1992/api/maillot';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Maillot[]> {
    return this.http.get<Maillot[]>(`${this.baseUrl}`);
  }
}
