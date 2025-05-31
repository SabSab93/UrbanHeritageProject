import { Component } from '@angular/core';
import { CommonModule }                          from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, ValidationErrors, AbstractControl
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute }  from '@angular/router';
import { AuthRegisterService }                   from '../../../services/auth-service/auth-register.service';

@Component({
  selector   : 'app-auth-register',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-register.component.html',
  styleUrls  : ['./auth-register.component.scss']
})
export class AuthRegisterComponent {

  registerForm   : FormGroup;
  errorMessage   = '';
  successMessage = '';

  civiliteOptions = ['non_specifie', 'femme', 'homme'];
  private returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private registerService: AuthRegisterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    /* ---------------------- formulaire ---------------------- */
    this.registerForm = this.fb.group(
      {
        nom_client:   ['', Validators.required],
        prenom_client:[''],
        civilite:     ['non_specifie', Validators.required],
        date_naissance_client: ['', Validators.required],

        adresse_client:     ['', Validators.required],
        code_postal_client: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        ville_client:       ['', Validators.required],
        pays_client:        ['', Validators.required],

        adresse_mail_client: ['', [Validators.required, Validators.email]],

        mot_de_passe:      ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword:   ['', Validators.required]          // ← confirmation
      },
      { validators: this.passwordsMatchValidator }            // ← validateur groupe
    );

    this.returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  /* --------- validateur qui ajoute l'erreur 'passwordsMismatch' --------- */
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const p1 = group.get('mot_de_passe')?.value;
    const p2 = group.get('confirmPassword')?.value;
    return p1 && p2 && p1 !== p2 ? { passwordsMismatch: true } : null;
  }

  /* --------------------------- submit --------------------------- */
  onSubmit(): void {
    if (this.registerForm.invalid) return;

    /* inutile de transmettre confirmPassword au backend */
    const { confirmPassword, ...payload } = this.registerForm.value;

    this.errorMessage   = '';
    this.successMessage = '';

    this.registerService.registerClient(payload).subscribe({
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
