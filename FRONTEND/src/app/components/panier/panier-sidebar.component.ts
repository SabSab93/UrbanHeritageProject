// src/app/components/panier/panier-sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  filter,
  switchMap,
  tap,
  mapTo,
  map,
  withLatestFrom,
  shareReplay
} from 'rxjs/operators';
import { Observable, Subject, merge } from 'rxjs';

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
  total$!: Observable<{ total: string }>;

  private reload$ = new Subject<void>();

  constructor(
    public panierUi: PanierUiService,
    private panierSrv: PanierService,
    private authLogin: AuthLoginService
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
      switchMap(([_, id]) => this.panierSrv.getCartLines(id))
    );

    // 5) total du panier
    this.total$ = trigger$.pipe(
      withLatestFrom(clientId$),
      switchMap(([_, id]) => this.panierSrv.getCartTotal(id))
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
}
