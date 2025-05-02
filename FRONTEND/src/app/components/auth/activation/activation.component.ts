import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service'; 
import { Client } from '../../../models/client.model';

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
    if (token) {
        this.http.post<{ message: string, token: string, client: Client }>(
            `http://localhost:1992/api/auth/activate/${token}`, {}
          ).subscribe({
            next: (res) => {
              this.authLoginService.loginManuel(res.token, res.client); 
              this.router.navigate(['/'], { queryParams: { activated: '1' } });
            },
            error: (err) => {
              this.router.navigate(['/'], {
                queryParams: { activated: '0', error: err?.error?.message }
              });
            }
          });
    } else {
      this.router.navigate(['/'], { queryParams: { activated: '0' } });
    }
  }
}
