
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Personnalisation } from '../models/personnalisation.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PersonnalisationService {
  private readonly url = `${environment.apiUrl}/personnalisation`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Personnalisation[]> {
    return this.http.get<Personnalisation[]>(this.url);
  }
}
