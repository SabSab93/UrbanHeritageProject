import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private registerService: AuthRegisterService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nom_client: ['', Validators.required],
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
  
    // ✅ Ajout ici : efface l’erreur si l’email change
    this.registerForm.get('adresse_mail_client')?.valueChanges.subscribe(() => {
      if (this.errorMessage === 'Email déjà utilisé') {
        this.errorMessage = '';
      }
    });
  }
  
  onSubmit() {
    console.log('Formulaire valide ? =>', this.registerForm.valid);
    console.log(this.registerForm.value);
    if (this.registerForm.invalid) {
      console.warn('⚠️ Formulaire invalide', this.registerForm.errors, this.registerForm.value);
      return;
    }

    this.registerService.registerClient(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Inscription réussie ! Vérifie ton e-mail pour activer ton compte.';
        this.errorMessage = '';
        this.registerForm.reset();

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err: { error: { message: string; }; }) => {
        this.successMessage = '';
        this.errorMessage = err?.error?.message || 'Erreur inconnue';
      }
    });
  }
}
