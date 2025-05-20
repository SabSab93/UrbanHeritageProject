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
    // 1) ouverture sidebar
    this.isOpen$ = this.panierUi.isSidebarOpen$;

    // 2) récupère id_client (number) ou null
    const clientId$ = this.authLogin.client$.pipe(
      map(c => c?.id_client ?? null),
      shareReplay(1)
    );

    // 3) triggers : ouverture OU reload
    const open$ = this.isOpen$.pipe(filter(open => open), mapTo(undefined));
    const trigger$ = merge(open$, this.reload$);

    // 4) lignes du panier
    this.lignes$ = trigger$.pipe(
      withLatestFrom(clientId$),
      switchMap(([_, id]) => this.panierSrv.getCartLines(id)),
      map(lines => {
        const grouped: { [key: string]: LignePanier } = {};
        for (const l of lines) {
          const key = [
            l.id_maillot,
            l.taille_maillot,
            l.id_personnalisation ?? 'none',
            l.valeur_personnalisation ?? '',
            l.couleur_personnalisation ?? ''
          ].join('|');
          if (!grouped[key]) {
            grouped[key] = { ...l };  // clone l avec son prix_ht unitaire et sa quantite initiale
          } else {
            grouped[key].quantite += l.quantite;
            // on NE CHANGE PAS grouped[key].prix_ht : c'est le prix unitaire HT
          }
        }
        return Object.values(grouped);
      })
    );

    // 5) total du panier
    this.total$ = trigger$.pipe(
          withLatestFrom(clientId$),
          switchMap(([_, id]) => this.panierSrv.getCartTotal(id)),
          map(res => {
            console.log('DEBUG total panier', res); // <— un petit log pour vérifier
            return res.total;
          })
        );
      }

  close(): void {
    this.panierUi.closeSidebar();
  }

  removeLine(id: number): void {
    const idClient = this.authLogin.clientSubject?.value?.id_client ?? null;
    this.panierSrv.removeLine(id, idClient).subscribe({
      next: () => this.reload$.next(),
      error: err => console.error('❌ Erreur suppression ligne', err)
    });
  }
  onCheckout(): void {
    // Si connecté, on va directement à la confirmation
    const clientId = this.authLogin.currentClientId;
    if (clientId) {
      this.close();
      this.router.navigate(['/confirmation']);
    } else {
      // Sinon, on ferme la sidebar et on redirige vers connexion
      // avec un returnUrl pour revenir après login
      this.close();
      this.router.navigate(['/connexion'], {
        queryParams: { returnUrl: '/confirmation' }
      });
    }
  }
}
