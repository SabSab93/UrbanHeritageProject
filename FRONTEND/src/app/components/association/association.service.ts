import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Association } from '../../models/association.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssociationService {
  private readonly baseUrl = `${environment.apiUrl}/association`;

  constructor(private http: HttpClient) {}

  /** Récupère toutes les associations */
  getAssociations(): Observable<Association[]> {
    return this.http.get<Association[]>(this.baseUrl);
  }

  /** Récupère une association par ID */
  getAssociation(id: number): Observable<Association> {
    return this.http.get<Association>(`${this.baseUrl}/${id}`);
  }
}
