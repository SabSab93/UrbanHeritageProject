// src/app/maillot/collection/collection.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';

import { MaillotService }    from '../maillot.service';
import { Maillot }           from '../../models/maillot.model';

import { HeaderComponent }   from '../../components/home-page/shared/header/header.component';
import { FooterComponent }   from '../../components/home-page/shared/footer/footer.component';

import { PanierService }     from '../../components/panier/panier.service';
import { PanierUiService }   from '../../components/panier/panier-sidebar.service';
import { AuthLoginService }  from '../../services/auth-service/auth-login.service';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  maillots: Maillot[] = [];
  loading  = true;
  error    = '';
  filter   = 'all';

  filterList = [
    { key: 'all',           label: 'Afficher tout'  },
    { key: 'nouveautes',    label: 'Nouveautés'     },
    { key: 'coup-de-coeur', label: 'Les plus vendus'}
  ];

  constructor(
    private svc       : MaillotService,
    private panierSrv : PanierService,
    private panierUi  : PanierUiService,
    private authLogin : AuthLoginService
  ) {}

  ngOnInit(): void {
    this.loadMaillots();
  }

  setFilter(key: string) {
    if (this.filter === key) return;
    this.filter = key;
    this.loadMaillots();
  }

  /** Récupère les maillots selon le filtre actif */
  private loadMaillots() {
    this.loading = true;
    this.error   = '';

    let obs;
    switch (this.filter) {
      case 'nouveautes':     obs = this.svc.getNewArrivals();  break;
      case 'coup-de-coeur':  obs = this.svc.getBestSellers();  break;
      default:               obs = this.svc.getAll();
    }

    obs.subscribe({
      next : data => { this.maillots = data; this.loading = false; },
      error: ()   => { this.error   = 'Impossible de charger la collection';
                       this.loading = false; }
    });
  }

  /** Ajoute un maillot au panier puis ouvre la side-bar */
  addToCart(maillot: Maillot, taille: string) {
    const id_client = this.authLogin.currentClientId;  

    this.panierSrv.addLine({
      ...(id_client !== null ? { id_client } : {}),     
      id_maillot     : maillot.id_maillot,
      taille_maillot : taille,
      quantite       : 1
    }).subscribe({
      next : ()  => this.panierUi.toggleSidebar(),
      error: err => console.error('Erreur addToCart', err)
    });
  }
}
