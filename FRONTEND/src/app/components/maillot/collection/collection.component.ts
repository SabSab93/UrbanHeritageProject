import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MaillotService } from '../maillot.service';
import { Maillot } from '../../../models/maillot.model';

import { HeaderComponent } from '../../home-page/shared/header/header.component';
import { FooterComponent } from '../../home-page/shared/footer/footer.component';

import { PanierService } from '../../panier/panier.service';
import { PanierUiService } from '../../panier/panier-sidebar.service';
import { AuthLoginService } from '../../../services/auth-service/auth-login.service';
import { StockService, Disponibilite } from '../../../services/stock.service';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  maillots: (Maillot & { outOfStock: boolean; availableSizes: string[] })[] = [];
  loading = true;
  error = '';
  filter = 'all';

  filterList = [
    { key: 'all', label: 'Afficher tout' },
    { key: 'nouveautes', label: 'Nouveautés' },
    { key: 'coup-de-coeur', label: 'Les plus vendus' }
  ];

  constructor(
    private svc: MaillotService,
    private panierSrv: PanierService,
    private panierUi: PanierUiService,
    private authLogin: AuthLoginService,
    private stockSrv: StockService
  ) {}

  ngOnInit(): void {
    this.loadMaillots();
  }

  setFilter(key: string): void {
    if (this.filter === key) return;
    this.filter = key;
    this.loadMaillots();
  }

  /** Charge les maillots et calcule disponibilité par taille */
  private loadMaillots(): void {
    this.loading = true;
    this.error = '';

    let obs: Observable<Maillot[]>;
    switch (this.filter) {
      case 'nouveautes': obs = this.svc.getNewArrivals(); break;
      case 'coup-de-coeur': obs = this.svc.getBestSellers(); break;
      default: obs = this.svc.getAll();
    }

    obs.subscribe({
      next: data => {
        // Pour chaque maillot, on récupère la dispo par taille
        forkJoin(
          data.map(m =>
            this.stockSrv.getDisponibilitePublic(m.id_maillot).pipe(
              map((liste: Disponibilite[]) => {
                const availableSizes = liste
                  .filter(d => d.quantite_disponible > 0)
                  .map(d => d.taille_maillot);
                const outOfStock = availableSizes.length === 0;
                return {
                  ...m,
                  outOfStock,
                  availableSizes
                };
              })
            )
          )
        ).subscribe({
          next: enriched => {
            this.maillots = enriched;
            this.loading = false;
          },
          error: () => {
            this.error = 'Erreur lors de la vérification du stock';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Impossible de charger la collection';
        this.loading = false;
      }
    });
  }

  /** Ajoute un maillot au panier */
  public addToCart(
    maillot: Maillot & { outOfStock: boolean; availableSizes: string[] },
    taille: string
  ): void {
    if (maillot.outOfStock || !maillot.availableSizes.includes(taille)) return;
    const id_client = this.authLogin.currentClientId;
    this.panierSrv
      .addLine({
        id_client: id_client ?? undefined,
        id_maillot: maillot.id_maillot,
        taille_maillot: taille,
        quantite: 1,
        prix_ht: maillot.prix_ht_maillot,
        Maillot: {
          nom_maillot: maillot.nom_maillot,
          url_image_maillot_1: maillot.url_image_maillot_1
        }
      })
      .subscribe(() => this.panierUi.toggleSidebar());
  }
}