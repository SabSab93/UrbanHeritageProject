// src/app/paiement-success/paiement-success.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommandeService } from '../../services/commande.service';

@Component({
  selector: 'app-paiement-success',
  standalone: true, // 👈  composant "stand‑alone" (Angular ≥14)
  imports: [CommonModule], // 👉  rend *ngIf disponible
  template: `
    <div class="container text-center mt-5" *ngIf="state==='ok'">
      <h1>Paiement réussi&nbsp;!</h1>
      <p>Merci pour votre commande 🎉 Un e‑mail de confirmation vient de partir.</p>
      <button class="btn btn-primary" (click)="goHome()">Accueil</button>
    </div>

    <div class="container text-center mt-5" *ngIf="state==='wait'">
      <h3>Validation de votre paiement…</h3>
      <p>Quelques secondes ✌️</p>
    </div>
  `,
})
export class PaymentSuccessComponent implements OnInit {
  state: 'wait' | 'ok' = 'wait';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cmdSrv: CommandeService,
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (!sessionId) return this.fail('missing_session');

    // 1️⃣ Récupérer la session Stripe depuis l'API backend
    this.cmdSrv.getCheckoutSession(sessionId).subscribe({
      next: (sess) => {
        const idCmd = Number(sess.metadata?.id_commande);
        if (!idCmd) return this.fail('missing_cmd');
        // 2️⃣ Vérifier la commande (avec 3 tentatives max)
        this.checkCommandeStatus(idCmd, 0);
      },
      error: () => this.fail('session_error'),
    });
  }

  /**
   * Vérifie l'état de la commande, réessaie jusqu'à 3 fois si encore "en attente".
   */
  private checkCommandeStatus(idCmd: number, attempt: number): void {
    this.cmdSrv.getCommande(idCmd).subscribe({
      next: (cmd) => {
        if (cmd.statut_paiement === 'paye') {
          this.state = 'ok';
        } else if (attempt < 3) {
          setTimeout(() => this.checkCommandeStatus(idCmd, attempt + 1), 3000);
        } else {
          this.fail('payment_pending');
        }
      },
      error: () => this.fail('api_error'),
    });
  }

  /** Navigue vers la page d'accueil */
  goHome(): void {
    this.router.navigateByUrl('/');
  }

  /** Redirige vers /paiement/cancel avec une raison lisible */
  private fail(code: string): void {
    this.router.navigate(['/paiement/cancel'], { queryParams: { reason: code } });
  }
}
