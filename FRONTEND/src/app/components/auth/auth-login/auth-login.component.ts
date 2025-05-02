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
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authLoginService: AuthLoginService, // ✅ utilise le service centralisé
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authLoginService.login(email, password).subscribe({
      next: () => {
        this.authLoginService.reloadClient();; // 🔁 met à jour le client$
        this.router.navigate(['/']); // ✅ redirection après succès
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur de connexion';
      }
    });
  }
}
