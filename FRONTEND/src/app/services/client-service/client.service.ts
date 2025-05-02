// client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Client } from '../../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private baseUrl = 'http://localhost:1992/api/auth'; 
  private clientSubject = new BehaviorSubject<Client | null>(null);
  public client$ = this.clientSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadClient(); // au démarrage, on tente de charger le client
  }

  /** Charge les infos du client connecté (si token) */
  loadClient(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('⚠️ Aucun token trouvé dans localStorage');
      return;
    }
  
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<Client>(`${this.baseUrl}/me`, { headers }).pipe(
      tap(client => {
        console.log('✅ Client récupéré depuis /me :', client);
        this.clientSubject.next(client);
      }),
      catchError((err) => {
        console.error('❌ Erreur lors du GET /me :', err);
        this.clientSubject.next(null);
        return of(null);
      })
    ).subscribe();
  }
  
  /** Déconnexion */
  clearClient(): void {
    this.clientSubject.next(null);
  }
}
