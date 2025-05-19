// src/app/components/auth/auth-register/auth-register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthRegisterService } from '../../../services/auth-service/auth-register.service';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-register.component.html',
  styleUrls: ['./auth-register.component.scss']
})
export class AuthRegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  civiliteOptions = ['non_specifie', 'femme', 'homme'];
  private returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private registerService: AuthRegisterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      nom_client: ['' , Validators.required],
      prenom_client: [''],
      civilite: ['non_specifie', Validators.required],
      date_naissance_client: ['', Validators.required],
      adresse_client: ['', Validators.required],
      code_postal_client: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      ville_client: ['', Validators.required],
      pays_client: ['', Validators.required],
      adresse_mail_client: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.errorMessage = '';
    this.successMessage = '';

    this.registerService.registerClient(this.registerForm.value)
      .subscribe({
        next: res => {
          this.successMessage = res.message;
          if (res.message.startsWith('Inscription réussie')) {
            setTimeout(() => {
              this.router.navigate(['/connexion'], {
                queryParams: { returnUrl: this.returnUrl }
              });
            }, 1500);
          }
        },
        error: err => {
          this.errorMessage = err.error?.message || 'Erreur inconnue';
        }
      });
  }
}
