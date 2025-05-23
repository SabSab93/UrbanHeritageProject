import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  template: `
    <div class="text-center mt-5">
      <h1>Paiement annulé</h1>
      <p>{{ message }}</p>
      <button (click)="goHome()" class="btn btn-secondary">Retour à l’accueil</button>
    </div>
  `
})
export class PaymentCancelComponent implements OnInit {
  message = 'Votre commande n’a pas été finalisée. Vous pouvez réessayer plus tard.';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'payment_pending') {
      this.message = "Votre paiement n’a pas été finalisé. Veuillez réessayer.";
    } else if (reason === 'canceled') {
      this.message = "Vous avez annulé le paiement.";
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}