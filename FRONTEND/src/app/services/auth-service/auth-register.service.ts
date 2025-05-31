// src/app/auth-register/auth-register.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthRegisterService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

registerClient(data: any) {
  const headers = new HttpHeaders()
    .set('Content-Type', 'application/json; charset=utf-8');
  return this.http.post<{message: string}>(`${this.baseUrl}/register-client`,
                                         JSON.stringify(data), { headers });
}
}
