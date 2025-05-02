// src/app/auth-register/auth-register.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthRegisterService {
  private baseUrl = 'http://localhost:1992/api/auth'; // comme AuthLoginService

  constructor(private http: HttpClient) {}

  registerClient(data: any) {
    console.log('📡 Envoi POST à :', `${this.baseUrl}/register-client`, 'avec data :', data);
    return this.http.post<{ message: string }>(`${this.baseUrl}/register-client`, { data });
  }
}
