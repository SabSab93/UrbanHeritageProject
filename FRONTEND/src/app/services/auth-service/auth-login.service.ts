
// src/app/services/auth-service/auth-login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, tap, catchError, of, Observable } from 'rxjs';
import { Client } from '../../models/client.model';
@Injectable({ providedIn: 'root' })
export class AuthLoginService {
  private authUrl   = 'http://localhost:1992/api/auth';
  private clientUrl = 'http://localhost:1992/api/client';
  private tokenKey  = 'authToken';
  public clientSubject = new BehaviorSubject<Client | null>(null);
  public client$       = this.clientSubject.asObservable();
  constructor(private http: HttpClient) {
    this.restoreSession();
  }
  /** Connexion */
  login(email: string, mot_de_passe: string): Observable<string> {
    return this.http
      .post<{ token: string; client: Client }>(
        `${this.authUrl}/login`,
        { email, mot_de_passe }
      )
      .pipe(
        tap(({ token, client }) => {
          localStorage.setItem(this.tokenKey, token);
          this.clientSubject.next(client);
        }),
        map(({ token }) => token)
      );
  }
  /** Déconnexion */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.clientSubject.next(null);
  }
  /** Mise à jour du client */
    updateClient(
      id: number,
      data: Partial<Client>
    ): Observable<Client> {
      const token = localStorage.getItem(this.tokenKey) ?? '';
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http
        .put<{ message: string; client: Client }>(
          `${this.clientUrl}/${id}`,
          { data },     // on n’envoie QUE { data: { … } }
          { headers }
        )
        .pipe(
          tap(res => this.clientSubject.next(res.client)),
          map(res => res.client)
        );
    }
  /** Suppression/anonymisation RGPD */
  deleteAccount(id: number): Observable<any> {
    const token = localStorage.getItem(this.tokenKey) ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http
      .delete<{ message: string; client: Client }>(
        `${this.clientUrl}/${id}`,
        { headers }
      )
      .pipe(
        tap(() => {
          // Après anonymisation, déconnecte l’utilisateur
          this.logout();
        })
      );
  }
  /** Restaure la session si token présent */
  private restoreSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http
      .get<Client>(`${this.authUrl}/me`, { headers })
      .pipe(
        tap(client => this.clientSubject.next(client)),
        catchError(err => {
          this.logout();
          return of(null);
        })
      )
      .subscribe();
  }
  /** Force un rechargement manuel du client */
  reloadClient(): void {
    this.restoreSession();
  }
  /** Injection manuelle (tests, dev) */
  loginManuel(token: string, client: Client): void {
    localStorage.setItem(this.tokenKey, token);
    this.clientSubject.next(client);
  }
  /** Accès direct au client courant */
  get currentClient(): Client | null {
    return this.clientSubject.value;
  }
  get currentClientId(): number | null {
    return this.clientSubject.value?.id_client ?? null;
  }
    forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.authUrl}/forgot-password`,
      { email }
    );
  }
  // 2. Réinitialisation du mot de passe
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.authUrl}/reset-password?token=${token}`,
      { password }
    );
  }
}