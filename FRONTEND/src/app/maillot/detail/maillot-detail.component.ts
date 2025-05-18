import { Component, OnInit }                  from '@angular/core';
import { CommonModule }                       from '@angular/common';
import { ActivatedRoute, RouterModule }       from '@angular/router';

import { MaillotService }                     from '../maillot.service';
import { Maillot }                            from '../../models/maillot.model';

import { HeaderComponent }                    from '../../components/home-page/shared/header/header.component';
import { FooterComponent }                    from '../../components/home-page/shared/footer/footer.component';

import { PanierService }                      from '../../components/panier/panier.service';
import { PanierUiService }                    from '../../components/panier/panier-sidebar.service';
import { AuthLoginService }                   from '../../services/auth-service/auth-login.service';

import { PersonnalisationService }            from '../../services/personnalisation.service';
import { Personnalisation }                   from '../../models/personnalisation.model';

type Couleur = 'ROUGE' | 'VERT' | 'NOIR' | 'BLANC';

@Component({
  selector: 'app-maillot-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './maillot-detail.component.html',
  styleUrls: ['./maillot-detail.component.scss']
})
export class DetailComponent implements OnInit {
  maillot?: Maillot;
  personalisations: Personnalisation[] = [];
  loading = true;
  error = '';

  // états UI
  selectedSize: string | null = null;
  errorMessage: string | null = null;

  selectedPersoId: number | null = null;
  selectedPersoType: Personnalisation['type_personnalisation'] | null = null;
  valeur_personnalisation = '';
  couleur_personnalisation: Couleur = 'NOIR';
  couleurOptions: Couleur[] = ['ROUGE', 'VERT', 'NOIR', 'BLANC'];

  displayedPrice!: number;

  constructor(
    private route: ActivatedRoute,
    private svc: MaillotService,
    private panierSrv: PanierService,
    private panierUi: PanierUiService,
    private authLogin: AuthLoginService,
    private persoSvc: PersonnalisationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({
      next: m => {
        this.maillot = m;
        this.loading = false;
        this.displayedPrice = Number(m.prix_ht_maillot);
      },
      error: () => {
        this.error = 'Impossible de charger ce maillot';
        this.loading = false;
      }
    });

    this.persoSvc.getAll().subscribe({
      next: list => this.personalisations = list,
      error: err => console.error('Erreur perso :', err)
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
    if (this.selectedPersoId && !this.valeur_personnalisation) {
      this.errorMessage = 'Merci de saisir le texte de personnalisation.';
      return;
    }
    if (!this.maillot) return;

    const id_client = this.authLogin.currentClientId;
    const payload: any = {
      id_client:                id_client ?? undefined,
      id_maillot:               this.maillot.id_maillot,
      taille_maillot:           this.selectedSize,
      quantite:                 1,
      id_personnalisation:      this.selectedPersoId,
      valeur_personnalisation:  this.valeur_personnalisation || null,
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
