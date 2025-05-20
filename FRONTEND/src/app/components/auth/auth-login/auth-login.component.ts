// src/app/components/auth/auth-login/auth-login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';
import { PanierService } from '../../panier/panier.service';

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
  showResend = false;
  resendMessage = '';
  private returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authLoginService: AuthLoginService,
    private panierService: PanierService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  onSubmit(): void {
    this.showResend = false;
    this.resendMessage = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;

    this.authLoginService.login(email, password).subscribe({
      next: () => {
        // 1) Récupère le panier invité
        const guestLines = this.panierService.getGuestLines();
        const clientId = this.authLoginService.currentClientId!;
        // 2) Sync vers serveur
        guestLines.forEach(line => {
          this.panierService.addLine({
            id_client: clientId,
            id_maillot: line.id_maillot,
            taille_maillot: line.taille_maillot,
            quantite: line.quantite,
            prix_ht: line.prix_ht,
            Maillot: {
              nom_maillot: line.Maillot.nom_maillot,
              url_image_maillot_1: line.Maillot.url_image_maillot_1
            },
            id_personnalisation: line.id_personnalisation,
            valeur_personnalisation: line.valeur_personnalisation,
            couleur_personnalisation: line.couleur_personnalisation
          }).subscribe({ error: console.error });
        });
        // 3) Vide le panier invité
        this.panierService.clearGuest();
        // 4) Redirection finale
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        const msg = err.error?.message || 'Erreur de connexion';
        this.errorMessage = msg;
        if (err.status === 403 && msg === 'Compte non activé') {
          this.showResend = true;
        }
      }
    });
  }

  onResend(): void {
    const email = this.loginForm.get('email')?.value;
    this.authLoginService.resendActivation(email).subscribe({
      next: res => {
        this.resendMessage = res.message;
        this.showResend   = false;
      },
      error: err => {
        this.resendMessage = err.error?.message || 'Impossible de renvoyer le lien';
      }
    });
  }
}
