// src/app/components/auth/activation/activation.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';

@Component({
  selector: 'app-activation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="activation-page text-center p-5">
      <ng-container *ngIf="loading">
        Activation en cours…
      </ng-container>
      <ng-container *ngIf="!loading && success">
        <h3 class="text-success">✅ {{ message }}</h3>
        <!-- On redirige vers la page de connexion au lieu d'auto-login -->
        <button class="btn btn-primary mt-3" (click)="goToLogin()">
          Se connecter
        </button>
      </ng-container>
      <ng-container *ngIf="!loading && !success">
        <h3 class="text-danger">❌ {{ message }}</h3>
        <button class="btn btn-secondary mt-3" (click)="goToRegister()">
          Réessayer l’inscription
        </button>
      </ng-container>
    </div>
  `,
  styles: [`
    .activation-page { max-width: 400px; margin: auto; }
  `]
})
export class ActivationComponent implements OnInit {
  loading = true;
  success = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthLoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading = false;
      this.success = false;
      this.message = 'Aucun token fourni.';
      return;
    }

    this.auth.activateAccount(token).subscribe({
      next: res => {
        this.loading = false;
        this.success = true;
        this.message = res.message;
      },
      error: err => {
        this.loading = false;
        this.success = false;
        this.message = err.error?.message || 'Échec de l’activation';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }

  goToRegister() {
    this.router.navigate(['/inscription']);
  }
}
