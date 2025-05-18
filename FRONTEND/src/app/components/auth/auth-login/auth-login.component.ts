import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service'; // ✅

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthLoginComponent {
  loginForm: FormGroup;
  errorMessage   = '';

  // ← Nouveaux états pour le resend
  showResend     = false;
  resendMessage  = '';

  constructor(
    private fb: FormBuilder,
    private authLoginService: AuthLoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

onSubmit(): void {
  this.showResend = false;
  this.resendMessage = '';
  this.errorMessage = '';

  if (this.loginForm.invalid) return;
  const { email, password } = this.loginForm.value;

  this.authLoginService.login(email, password).subscribe({
    next: () => {
      this.router.navigate(['/']);
    },
    error: err => {
      const msg = err.error?.message || 'Erreur de connexion';
      this.errorMessage = msg;

      // si c'est notre 403 "Compte non activé", on affiche le bouton
      if (err.status === 403 && msg === 'Compte non activé') {
        this.showResend = true;
      }
    }
  });
}


  /** Lance la requête resend-activation */
  onResend(): void {
    const email = this.loginForm.get('email')?.value;
    this.authLoginService.resendActivation(email).subscribe({
      next: res => {
        this.resendMessage = res.message;
        this.showResend   = false;
      },
      error: err => {
        this.resendMessage = err.error?.message || 'Impossible de renvoyer le lien';
      }
    });
  }
}