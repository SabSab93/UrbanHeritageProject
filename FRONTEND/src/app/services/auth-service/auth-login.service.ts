import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
import { Client } from '../../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class AuhtLoginService {
  private baseUrl = 'http://localhost:1992/api/auth';
  private clientSubject = new BehaviorSubject<Client | null>(null);
  public client$ = this.clientSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  login(email: string, mot_de_passe: string): Observable<string> {
    return this.http.post<{ token: string, client: Client }>(`${this.baseUrl}/login`, { email, mot_de_passe }).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        this.clientSubject.next(response.client); // ⬅️ stocke le client
      }),
      map(res => res.token),
      catchError(err => {
        console.error('Erreur de connexion :', err);
        throw new Error('Erreur lors de la connexion. Veuillez réessayer.');
      })
    );
  }

  /** 🔁 Pour restaurer la session au chargement */
  private restoreSession(): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<Client>(`${this.baseUrl}/me`, { headers })
      .pipe(
        tap(client => this.clientSubject.next(client)),
        catchError(() => {
          this.clientSubject.next(null);
          return [];
        })
      ).subscribe();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.clientSubject.next(null);
  }
}
