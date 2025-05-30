import { Injectable }                from '@angular/core';
import { HttpClient, HttpHeaders }   from '@angular/common/http';
import { Observable }                from 'rxjs';
import { Avis }                      from '../models/avis.model';
import { environment }               from '../../environments/environment';

@Injectable({ providedIn: 'root' })

export class AvisService {
  private baseUrl = `${environment.apiUrl}/avis`;

  constructor(private http: HttpClient) {}

  getByMaillot(idMaillot: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(
      `${this.baseUrl}/maillot/${idMaillot}`
    );
  }

  getStats(idMaillot: number): Observable<{
    nombreAvis: number;
    noteMoyenne: string;
    avis: Avis[];
  }> {
    return this.http.get<{
      nombreAvis: number;
      noteMoyenne: string;
      avis: Avis[];
    }>(
      `${this.baseUrl}/maillot/${idMaillot}/stats`
    );
  }

  create(avis: Partial<Avis>): Observable<{ message: string }> {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${token}`
    });

    return this.http.post<{ message: string }>(
      `${this.baseUrl}/create`,
      { data: avis },
      { headers }
    );
  }
}


