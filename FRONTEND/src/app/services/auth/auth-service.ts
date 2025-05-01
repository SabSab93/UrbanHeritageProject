import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Client } from '../../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:1992/api/auth/login';
  private tokenKey = 'auth_token';

  private clientSubject = new BehaviorSubject<Client | null>(null);
  public client$ = this.clientSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Authentification avec email + mot de passe */
  login(email: string, password: string): Observable<{ token: string; client: Client }> {
    return this.http.post<{ token: string; client: Client }>(this.apiUrl, {
      email,
      mot_de_passe: password
    }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        this.clientSubject.next(response.client);
      })
    );
  }

  /** Récupération du token JWT */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Déconnexion */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.clientSubject.next(null);
  }
}
