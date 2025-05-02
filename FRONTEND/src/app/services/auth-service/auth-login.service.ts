/* src/app/services/auth-service/auth-login.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import { Client } from '../../models/client.model';

@Injectable({ providedIn: 'root' })
export class AuthLoginService {
  private baseUrl = 'http://localhost:1992/api/auth';
  private tokenKey = 'authToken';

  private clientSubject = new BehaviorSubject<Client | null>(null);
  client$ = this.clientSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  /* ---------- Login ---------- */
  login(email: string, mot_de_passe: string) {
    return this.http
      .post<{ token: string; client: Client }>(`${this.baseUrl}/login`, {
        email,
        mot_de_passe,
      })
      .pipe(
        tap(({ token, client }) => {
          localStorage.setItem(this.tokenKey, token);
          this.clientSubject.next(client);
        }),
        map(({ token }) => token)
      );
  }

  /* ---------- Déconnexion ---------- */
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.clientSubject.next(null);
  }

  /* ---------- Restauration au F5 ---------- */
  private restoreSession() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<Client>(`${this.baseUrl}/me`, { headers }).pipe(
      tap((c) => this.clientSubject.next(c)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    ).subscribe();
  }
}
