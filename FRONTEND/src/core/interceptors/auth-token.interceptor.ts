import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ClientService {
  constructor(private http: HttpClient) {}

  register(data: any) {
    // *PAS* `/client/register-client` si ton back attend POST /api/client/register
    return this.http.post(
      `${environment.apiUrl}/client/register`,
       data
    );
  }
}