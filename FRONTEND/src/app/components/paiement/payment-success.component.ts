/*───────────────────────────────────────────────────────────*/
/*  src/app/paiement-success/paiement-success.component.ts   */
/*───────────────────────────────────────────────────────────*/
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommandeService } from '../../services/commande.service';

type State = 'wait' | 'ok' | 'error';

@Component({
  selector: 'app-paiement-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Paiement validé -->
    <div class="container text-center mt-5" *ngIf="state==='ok'">
      <h1>Paiement réussi !</h1>
      <p>Merci pour votre commande 🎉 Un e-mail de confirmation vient de partir.</p>
      <button class="btn btn-primary" (click)="goHome()">Accueil</button>
    </div>

    <!-- Vérification en cours -->
    <div class="container text-center mt-5" *ngIf="state==='wait'">
      <h3>Validation de votre paiement…</h3>
      <p>Quelques secondes ✌️</p>
    </div>

    <!-- Erreur -->
    <div class="container text-center mt-5" *ngIf="state==='error'">
      <h3 class="text-danger">Oups ! Un problème est survenu.</h3>
      <p>Votre paiement n’a pas pu être confirmé.</p>
      <button class="btn btn-secondary" (click)="goHome()">Retour à l’accueil</button>
    </div>
  `,
})
export class PaymentSuccessComponent implements OnInit {
  state: State = 'wait';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cmdSrv: CommandeService,
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (!sessionId) {
      this.fail('missing_session');
      return;
    }

    /* 1️⃣  Récupérer la session Stripe depuis l’API publique */
    this.cmdSrv.getCheckoutSessionPublic(sessionId).subscribe({
      next: (sess) => {
        const idCmd = Number(sess.id_commande);
        if (!idCmd) return this.fail('missing_cmd');

        /* 2️⃣  Vérifier la commande (jusqu’à 3 tentatives) */
        this.checkCommandeStatus(idCmd, 0);
      },
      error: () => this.fail('session_error'),
    });
  }

  /**
   * Vérifie l’état de la commande.
   * → 3 tentatives : 0 s / 3 s / 6 s
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

  /*---------- Navigation utilitaires ----------*/
  goHome(): void {
    this.router.navigateByUrl('/');
  }

  /** Redirige vers /paiement/cancel (ou affiche l’erreur locale) */
  private fail(_code: string): void {
    /* Si vous préférez garder la route /paiement/cancel :
    this.router.navigate(['/paiement/cancel'], { queryParams: { reason: _code } });
    */
    this.state = 'error';
  }
}
