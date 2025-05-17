import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service'; 
import { Client } from '../../../models/client.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-activation',
  template: `<div class="text-center p-5">Activation de compte en cours...</div>`,
})
export class ActivationComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private authLoginService: AuthLoginService // pour login auto
  ) {}

   ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      return ;
    }

    const url = `${environment.apiUrl}/auth/activate/${token}`;
    this.http.post<{ message: string; token: string; client: Client }>(url, {})
      .subscribe({
        next: ({ token, client }) => {
          this.authLoginService.loginManuel(token, client);
          this.router.navigate(['/'], { queryParams: { activated: '1' } });
        },
        error: (err) => {
          this.router.navigate(['/'], {
            queryParams: {
              activated: '0',
              error: err?.error?.message ?? 'Erreur inconnue'
            }
          });
        }
      });
  }
}
