import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <h1>Étape suivante : modalités de livraison</h1>
      <p>Vous êtes bien connecté·e, et voici votre panier validé.</p>
      <p>Plus loin, vous pourrez choisir la méthode de livraison, l’adresse, etc.</p>
      <a routerLink="/" class="btn btn-secondary mt-3">Retour à l’accueil</a>
    </div>
  `,
  styles: [`
    .container { max-width: 600px; text-align: center; }
  `]
})
export class ConfirmationComponent {}