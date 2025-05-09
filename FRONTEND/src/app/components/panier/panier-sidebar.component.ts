// src/app/components/panier/panier-sidebar.component.ts
import { Component, OnInit }         from '@angular/core';
import { CommonModule }              from '@angular/common';
import { RouterModule }              from '@angular/router';

import { filter, switchMap, tap, shareReplay } from 'rxjs/operators';
import { Observable, of }            from 'rxjs';

import { PanierUiService }           from './panier-sidebar.service';
import { PanierService, LignePanier } from './panier.service';
import { AuthLoginService }          from '../../services/auth-service/auth-login.service';
import { Client }                    from '../../models/client.model';

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

  private clientId: number | null = null;

  constructor(
    private panierUi : PanierUiService,
    private panierSrv: PanierService,
    private authLogin: AuthLoginService
  ) {}

  ngOnInit(): void {
    // 1) état open / close
    this.isOpen$ = this.panierUi.isSidebarOpen$;
    this.isOpen$.subscribe(open => console.log('Sidebar open:', open));

    // 2) flux client
    const client$ = this.authLogin.client$.pipe(
      tap(c => console.log('client$ emitted:', c)),
      filter((c): c is Client => c !== null),
      tap(c => {
        this.clientId = c.id_client;
        console.log('clientId set to:', this.clientId);
      }),
      shareReplay(1)
    );

    // 3) flux lignes
    this.lignes$ = client$.pipe(
      switchMap(c => {
        console.log('Loading cart lines for client', c.id_client);
        return this.panierSrv.getCartLines(c.id_client);
      }),
      tap(lines => console.log('Received lines:', lines))
    );

    // 4) flux total
    this.total$ = client$.pipe(
      switchMap(c => {
        console.log('Loading cart total for client', c.id_client);
        return this.panierSrv.getCartTotal(c.id_client);
      }),
      tap(total => console.log('Received total:', total))
    );
  }

  close(): void {
    console.log('close() called');
    this.panierUi.closeSidebar();
  }

  removeLine(id: number): void {
    console.log('removeLine() called with id', id);
    if (!this.clientId) {
      console.warn('removeLine(): no clientId');
      return;
    }

    this.panierSrv.removeLine(id).subscribe({
      next: () => {
        console.log('Line removed, reloading cart for client', this.clientId);
        this.lignes$ = this.panierSrv.getCartLines(this.clientId!);
        this.total$  = this.panierSrv.getCartTotal(this.clientId!);
      },
      error: err => console.error('Error removing line:', err)
    });
  }
}
