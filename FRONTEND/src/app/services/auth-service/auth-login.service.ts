import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  map,
  tap,
  catchError,
  of,
  Observable,
} from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Client } from '../../models/client.model';
import { environment } from '../../../environments/environment';

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthLoginService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly clientUrl = `${environment.apiUrl}/client`;

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
        { data },
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

  /** Changement de mot de passe */
  changePassword(payload: ChangePasswordPayload): Observable<{ message: string }> {
    const token = localStorage.getItem(this.tokenKey) ?? '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch<{ message: string }>(
      `${this.authUrl}/change-password`,
      payload,
      { headers }
    );
  }

  /** Mot de passe oublié */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.authUrl}/forgot-password`,
      { email }
    );
  }

  /** Réinitialisation du mot de passe */
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.authUrl}/reset-password?token=${token}`,
      { password }
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
  resendActivation(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/resend-activation`,
      { email }
    );
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
  activateAccount(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/activate/${token}`,
      {}
    );
  }
}
