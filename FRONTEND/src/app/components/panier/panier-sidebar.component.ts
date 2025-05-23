// src/app/components/panier/panier-sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  filter,
  switchMap,
  tap,
  mapTo,
  withLatestFrom,
  shareReplay
} from 'rxjs/operators';
import { Observable, Subject, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { PanierUiService } from './panier-sidebar.service';
import { PanierService } from './panier.service';
import { AuthLoginService } from '../../services/auth-service/auth-login.service';
import { LignePanier } from '../../models/ligne-panier.model';

@Component({
  selector: 'app-panier-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panier-sidebar.component.html',
  styleUrls: ['./panier-sidebar.component.scss']
})
export class PanierSidebarComponent implements OnInit {
  isOpen$!: Observable<boolean>;
  lignes$!: Observable<LignePanier[]>;
  total$!: Observable<number>;

  private reload$ = new Subject<void>();

  constructor(
    public panierUi: PanierUiService,
    private panierSrv: PanierService,
    private authLogin: AuthLoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    /* 1️⃣  ouverture/fermeture sidebar */
    this.isOpen$ = this.panierUi.isSidebarOpen$;

    /* 2️⃣  id_client courant (null si invité) */
    const clientId$ = this.authLogin.client$.pipe(
      map(c => c?.id_client ?? null),
      shareReplay(1)
    );

    /* 3️⃣  déclencheurs : ouverture ou demande reload() */
    const open$    = this.isOpen$.pipe(filter(o => o), mapTo(undefined));
    const trigger$ = merge(open$, this.reload$);

    /* 4️⃣  lignes du panier */
    this.lignes$ = trigger$.pipe(
      withLatestFrom(clientId$),
      switchMap(([_, id]) => this.panierSrv.getCartLines(id)),
      map(lines => {
        /* regrouper mêmes articles + perso + taille */
        const grouped: Record<string,LignePanier> = {};
        for (const l of lines) {
          const key = [
            l.id_maillot,
            l.taille_maillot,
            l.id_personnalisation ?? 'none',
            l.valeur_personnalisation ?? '',
            l.couleur_personnalisation ?? ''
          ].join('|');
          if (!grouped[key]) {
            grouped[key] = { ...l };
          } else {
            grouped[key].quantite += l.quantite;
          }
        }
        return Object.values(grouped);
      })
    );

    /* 5️⃣  total TTC du panier */
    this.total$ = trigger$.pipe(
      withLatestFrom(clientId$),
      switchMap(([_, id]) => this.panierSrv.getCartTotal(id)),
      map(res => res.total)
    );
  }

  /* ---------- actions ---------- */
  close(): void {
    this.panierUi.closeSidebar();
  }

  removeLine(idLigne: number): void {
    const idClient = this.authLogin.currentClientId;
    /* nouvelle signature : (idClient, idLigne) */
    this.panierSrv.removeLine(idClient, idLigne).subscribe({
      next: () => this.reload$.next(),
      error: err => console.error('❌ Erreur suppression ligne', err)
    });
  }

  onCheckout(): void {
    const clientId = this.authLogin.currentClientId;
    this.close();
    if (clientId) {
      this.router.navigate(['/confirmation']);
    } else {
      this.router.navigate(['/connexion'], {
        queryParams: { returnUrl: '/confirmation' }
      });
    }
  }
}
