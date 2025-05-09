import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import { Client } from '../../models/client.model';

@Injectable({ providedIn: 'root' })
export class AuthLoginService {
  private baseUrl = 'http://localhost:1992/api/auth';
  private tokenKey = 'authToken';

  private clientSubject = new BehaviorSubject<Client | null>(null);
  public client$ = this.clientSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession(); // au chargement
  }

  /** Connexion */
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

  /** Déconnexion */
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.clientSubject.next(null);
  }

  /** Récupération du client au rechargement */
  private restoreSession() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<Client>(`${this.baseUrl}/me`, { headers }).pipe(
      tap(client => {
        console.log('✅ Client restauré depuis /me', client);
        this.clientSubject.next(client);
      }),
      catchError(err => {
        console.error('❌ Erreur de restauration de session', err);
        this.logout();
        return of(null);
      })
    ).subscribe();
  }

  /** Forcer rechargement manuel du client (si besoin) */
  reloadClient() {
    this.restoreSession();
  }
  
  loginManuel(token: string, client: Client) {
    localStorage.setItem('authToken', token);
    this.clientSubject.next(client);
  }
    get currentClient(): Client | null {
    return this.clientSubject.value;
  }

  get currentClientId(): number | null {
    return this.clientSubject.value?.id_client ?? null;
  }
}
