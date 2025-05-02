import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthUiService } from '../../../services/auth-service/auth-sidebar.service';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';

@Component({
  selector: 'app-auth-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-sidebar.component.html',
  styleUrls: ['./auth-sidebar.component.scss']
})
export class AuthSidebarComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public authLoginService: AuthLoginService,
    public authUi: AuthUiService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  toggleSidebar() {
    this.authUi.toggleSidebar();
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.authLoginService.login(email, password).subscribe({
      next: () => this.authUi.closeSidebar(),
      error: (err: { error: { message: string; }; }) => this.errorMessage = err?.error?.message || 'Erreur inconnue',
    });
  }
}
