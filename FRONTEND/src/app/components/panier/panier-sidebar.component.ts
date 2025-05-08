// src/app/components/panier/panier-sidebar.component.ts
import { Component }       from '@angular/core';
import { CommonModule }    from '@angular/common';
import { RouterModule }    from '@angular/router';
import { PanierUiService } from './panier-sidebar.service';
import { PanierService, LignePanier } from './panier.service';
import { Observable }      from 'rxjs';

@Component({
  selector: 'app-panier-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panier-sidebar.component.html',
  styleUrls: ['./panier-sidebar.component.scss']
})
export class PanierSidebarComponent {
  isOpen$!: Observable<boolean>;
  lignes$!: Observable<LignePanier[]>;
  total$!: Observable<{ total: string }>;

  private clientId = 1; // remplace par l’ID du client courant

  constructor(
    private panierUi: PanierUiService,
    private panierSrv: PanierService
  ) {
    this.isOpen$ = this.panierUi.isSidebarOpen$;
    this.lignes$ = this.panierSrv.getCartLines(this.clientId);
    this.total$  = this.panierSrv.getCartTotal(this.clientId);
  }

  close() {
    this.panierUi.closeSidebar();
  }

  removeLine(id: number) {
    this.panierSrv.removeLine(id).subscribe(() => {
      // rafraîchir la liste et le total après suppression
      this.lignes$ = this.panierSrv.getCartLines(this.clientId);
      this.total$  = this.panierSrv.getCartTotal(this.clientId);
    });
  }
}
