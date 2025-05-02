import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthUiService } from '../../../services/auth-service/auth-sidebar.service';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-auth-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-sidebar.component.html',
  styleUrls: ['./auth-sidebar.component.scss']
})
export class AuthSidebarComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public authLoginService: AuthLoginService,
    public authUi: AuthUiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  toggleSidebar(): void {
    this.authUi.toggleSidebar();
  }

  navigateToRegister(): void {
    this.authUi.closeSidebar();
    this.router.navigate(['/inscription']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.authLoginService.login(email, password).subscribe({
      next: () => {
        this.authUi.closeSidebar();
        this.router.navigate(['/']); // ✅ Redirection vers la page d’accueil
      },
      error: (err: { error: { message: string } }) => {
        this.errorMessage = err?.error?.message || 'Erreur inconnue';
      }
    });
  }
}
