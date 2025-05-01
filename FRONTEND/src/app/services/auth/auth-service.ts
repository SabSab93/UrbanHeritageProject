import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Client } from '../../models/client.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:1992/api/auth';
  private tokenKey = 'auth_token';

  private clientSubject = new BehaviorSubject<Client | null>(null);
  public client$ = this.clientSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession(); // 🔁 Restauration au chargement
  }

  login(email: string, password: string): Observable<{ token: string; client: Client }> {
    return this.http.post<{ token: string; client: Client }>(`${this.apiUrl}/login`, {
      email,
      mot_de_passe: password
    }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        this.clientSubject.next(response.client);
      })
    );
  }

  /** 🔁 Restaurer la session si un token est présent */
  private restoreSession(): void {
    const token = this.getToken();
    if (token) {
      this.http.get<Client>(`${this.apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (client) => this.clientSubject.next(client),
        error: () => this.logout() // Token invalide
      });
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.clientSubject.next(null);
  }
}
