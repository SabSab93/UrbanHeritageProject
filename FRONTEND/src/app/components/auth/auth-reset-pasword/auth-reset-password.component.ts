
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './auth-reset-password.component.html',
  styleUrls: ['./auth-reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token   = '';
  message = '';
  error   = '';
  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthLoginService,
    private router: Router
  ) {
    this.form = fb.group({
      password:    ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', Validators.required],
    }, {
      validators: g =>
        g.value.password === g.value.confirmPass ? null : { mismatch: true }
    });
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }
  onSubmit() {
    if (this.form.invalid || !this.token) return;
    this.auth.resetPassword(this.token, this.form.value.password).subscribe({
      next: () => {
        this.message = 'Mot de passe changé ! Redirection…';
        setTimeout(() => this.router.navigate(['/connexion']), 2000);
      },
      error: err => this.error = err.error?.message || 'Erreur serveur'
    });
  }
}
