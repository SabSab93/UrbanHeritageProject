// src/app/components/auth/auth-sidebar/auth-sidebar.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthUiService } from '../../../services/auth-service/auth-sidebar.service';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';
import { PanierService } from '../../panier/panier.service';
import { LignePanier } from '../../../models/ligne-panier.model';

@Component({
  selector: 'app-auth-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-sidebar.component.html',
  styleUrls: ['./auth-sidebar.component.scss']
})
export class AuthSidebarComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public authLoginService: AuthLoginService,
    public authUi: AuthUiService,
    private panierService: PanierService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  toggleSidebar(): void {
    this.authUi.toggleSidebar();
  }

  navigateToRegister(): void {
    this.authUi.closeSidebar();
    this.router.navigate(['/inscription']);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password } = this.loginForm.value;

    this.authLoginService.login(email, password).subscribe({
      next: () => {
        // 1) fusionner le panier invité
        const guestLines: LignePanier[] = this.panierService.getGuestLines();
        const clientId = this.authLoginService.currentClientId!;
        guestLines.forEach(line =>
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
          }).subscribe({ error: console.error })
        );
        this.panierService.clearGuest();

        // 2) fermer la sidebar et rediriger
        this.authUi.closeSidebar();
        this.router.navigate(['/']);
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Erreur inconnue';
      }
    });
  }
}
