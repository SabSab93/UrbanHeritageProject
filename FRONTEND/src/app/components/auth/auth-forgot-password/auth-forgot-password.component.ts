
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,     
  ],
  templateUrl: './auth-forgot-password.component.html',
  styleUrls: ['./auth-forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message = '';
  error   = '';
  constructor(
    fb: FormBuilder,
    private auth: AuthLoginService
  ) {
    this.form = fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  onSubmit() {
    if (this.form.invalid) return;
    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: res  => this.message = res.message,
      error: err => this.error   = err.error?.message || 'Erreur serveur'
    });
  }
}
