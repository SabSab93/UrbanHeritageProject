import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';

@Component({
  selector: 'app-auth-activation',
  standalone: true,
  imports: [CommonModule, RouterModule],      
  templateUrl: './auth-activation.component.html',
  styleUrls: ['./auth-activation.component.scss']
})
export class AuthActivationComponent implements OnInit {

  status: 'pending' | 'success' | 'error' = 'pending';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private authSrv: AuthLoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status  = 'error';
      this.message = 'Token manquant.';
      return;
    }

  
    this.authSrv.activateAccount(token).subscribe({
      next: res => {
        this.status  = 'success';
        this.message = res.message;            // « Compte activé avec succès »
        setTimeout(() => this.router.navigate(['/connexion']), 2000);
      },
      error: err => {
        this.status  = 'error';
        this.message = err.error?.message || 'Erreur serveur.';
      }
    });
  }
}
