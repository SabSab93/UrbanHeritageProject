// src/app/auth-register/auth-register.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthRegisterService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  registerClient(data: any) {
    console.log('📡 Envoi POST à :', `${this.baseUrl}/register-client`, 'avec', data);
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/register-client`,
      data               
    );
  }
}
