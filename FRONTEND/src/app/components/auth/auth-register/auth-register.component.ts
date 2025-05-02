import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router'; // ✅ ajout

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // ✅ ajout RouterModule ici
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
    private http: HttpClient,
    private router: Router // ✅ injection du Router
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
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const data = { data: this.registerForm.value };

    this.http.post('http://localhost:1992/api/auth/register-client', data).subscribe({
      next: () => {
        this.successMessage = 'Inscription réussie ! Vérifie ton e-mail pour activer ton compte.';
        this.errorMessage = '';
        this.registerForm.reset();

        // ✅ redirection possible après 2 sec par exemple
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (err) => {
        this.successMessage = '';
        this.errorMessage = err?.error?.message || 'Erreur inconnue';
      }
    });
  }
}
