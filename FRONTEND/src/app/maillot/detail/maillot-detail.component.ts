import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MaillotService } from '../maillot.service';
import { Maillot } from '../../models/maillot.model';

import { AvisService } from '../../services/avis.service';
import { Avis } from '../../models/avis.model';

import { HeaderComponent } from '../../components/home-page/shared/header/header.component';
import { FooterComponent } from '../../components/home-page/shared/footer/footer.component';

import { PanierService } from '../../components/panier/panier.service';
import { PanierUiService } from '../../components/panier/panier-sidebar.service';
import { AuthLoginService } from '../../services/auth-service/auth-login.service';

import { PersonnalisationService } from '../../services/personnalisation.service';
import { Personnalisation } from '../../models/personnalisation.model';

import { StockService, Disponibilite } from '../../services/stock.service';
import { map } from 'rxjs/operators';

type Couleur = 'ROUGE' | 'VERT' | 'NOIR' | 'BLANC';

@Component({
  selector: 'app-maillot-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './maillot-detail.component.html',
  styleUrls: ['./maillot-detail.component.scss']
})
export class DetailComponent implements OnInit {
  maillot?: Maillot & {
    availableSizes: string[];
    sizeQuantities: Record<string, number>;
    allOutOfStock: boolean;
  };
  personalisations: Personnalisation[] = [];
  loading = true;
  error = '';

  // UI selections
  selectedSize: string | null = null;
  errorMessage: string | null = null;

  selectedPersoId: number | null = null;
  selectedPersoType: Personnalisation['type_personnalisation'] | null = null;
  valeur_personnalisation = '';
  couleur_personnalisation: Couleur = 'NOIR';
  couleurOptions: Couleur[] = ['ROUGE', 'VERT', 'NOIR', 'BLANC'];

  displayedPrice!: number;
  stockThreshold = 30;

  // Avis
  avisList: Avis[] = [];
  moyenneAvis: number | null = null;
  nombreAvis = 0;
  loadingAvis = true;
  errorAvis = '';

  constructor(
    private route: ActivatedRoute,
    private svc: MaillotService,
    private avisSrv: AvisService,
    private panierSrv: PanierService,
    private panierUi: PanierUiService,
    private authLogin: AuthLoginService,
    private persoSvc: PersonnalisationService,
    private stockSrv: StockService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Charger les détails du maillot
    this.svc.getById(id).subscribe({
      next: m => {
        this.maillot = { ...m, availableSizes: [], sizeQuantities: {}, allOutOfStock: false };
        this.displayedPrice = Number(m.prix_ht_maillot);

        this.stockSrv.getDisponibilitePublic(id).pipe(
          map((liste: Disponibilite[]) => {
            const quantities: Record<string, number> = {};
            liste.forEach(d => (quantities[d.taille_maillot] = d.quantite_disponible));
            const availableSizes = liste.filter(d => d.quantite_disponible > 0).map(d => d.taille_maillot);
            const allOut = availableSizes.length === 0;
            return { availableSizes, sizeQuantities: quantities, allOutOfStock: allOut };
          })
        ).subscribe(info => {
          Object.assign(this.maillot!, info);
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger ce maillot.';
        this.loading = false;
      }
    });

    // Charger les personnalisations
    this.persoSvc.getAll().subscribe({
      next: list => this.personalisations = list,
      error: err => console.error('Erreur perso :', err)
    });

    // Charger les avis et statistiques
    this.avisSrv.getStats(id).subscribe({
      next: stats => {
        this.nombreAvis = stats.nombreAvis;
        this.moyenneAvis = +stats.noteMoyenne;
        this.avisList = stats.avis;
        this.loadingAvis = false;
      },
      error: err => {
        console.error('Erreur chargement avis :', err);
        this.errorAvis = 'Impossible de charger les avis pour ce maillot.';
        this.loadingAvis = false;
      }
    });
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.errorMessage = null;
  }

  onSelectPerso(id: number | null): void {
    this.selectedPersoId = id;
    this.valeur_personnalisation = '';
    this.couleur_personnalisation = 'NOIR';
    const p = this.personalisations.find(x => x.id_personnalisation === id);
    this.selectedPersoType = p?.type_personnalisation ?? null;
    const base = Number(this.maillot?.prix_ht_maillot ?? 0);
    const extra = p ? Number(p.prix_ht) : 0;
    this.displayedPrice = base + extra;
  }

  addToCart(): void {
    if (!this.selectedSize) {
      this.errorMessage = 'Merci de sélectionner une taille.';
      return;
    }
    if (!this.maillot) {
      this.errorMessage = 'Produit introuvable.';
      return;
    }
    if (this.maillot.allOutOfStock || !this.maillot.availableSizes.includes(this.selectedSize)) {
      this.errorMessage = 'Taille indisponible.';
      return;
    }
    if (this.selectedPersoId && !this.valeur_personnalisation) {
      this.errorMessage = 'Merci de saisir le texte de personnalisation.';
      return;
    }

    const id_client = this.authLogin.currentClientId;
    const payload: any = {
      id_client: id_client ?? undefined,
      id_maillot: this.maillot.id_maillot,
      taille_maillot: this.selectedSize,
      quantite: 1,
      prix_ht: this.displayedPrice,
      Maillot: {
        id_maillot: this.maillot.id_maillot,
        nom_maillot: this.maillot.nom_maillot,
        url_image_maillot_1: this.maillot.url_image_maillot_1
      },
      id_personnalisation: this.selectedPersoId,
      valeur_personnalisation: this.valeur_personnalisation || null,
      couleur_personnalisation: this.selectedPersoId ? this.couleur_personnalisation : null
    };

    this.panierSrv.addLine(payload).subscribe({
      next: () => {
        this.errorMessage = null;
        this.panierUi.toggleSidebar();
      },
      error: err => console.error('Erreur addLine :', err)
    });
  }
}
