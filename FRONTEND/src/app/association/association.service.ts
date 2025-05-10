// src/app/services/association.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Association } from '../models/association.model';

@Injectable({ providedIn: 'root' })
export class AssociationService {
  private base = 'http://localhost:1992/api/association';

  constructor(private http: HttpClient) {}

  /** Récupère toutes les associations */
  getAssociations(): Observable<Association[]> {
    return this.http.get<Association[]>(this.base);
  }

  /** Récupère une association par ID */
  getAssociation(id: number): Observable<Association> {
    return this.http.get<Association>(`${this.base}/${id}`);
  }
}
