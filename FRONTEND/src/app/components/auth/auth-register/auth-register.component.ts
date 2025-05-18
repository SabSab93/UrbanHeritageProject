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
    if (this.registerForm.invalid) return;

    this.registerService.registerClient(this.registerForm.value)
      .subscribe({
        next: (res) => {
          // Affiche le message renvoyé : 
          // - "Inscription réussie ! …" 
          // - "Un nouveau lien d'activation …" 
          // - "Ton compte est déjà activé …"
          this.successMessage = res.message;
          this.errorMessage = '';
          this.registerForm.reset();

          // Si c'est bien une première inscription, on peut rediriger
          if (res.message.startsWith('Inscription réussie')) {
            setTimeout(() => this.router.navigate(['/']), 2000);
          }
        },
        error: (err) => {
          this.successMessage = '';
          this.errorMessage = err.error?.message || 'Erreur inconnue';
        }
      });
  }
}
