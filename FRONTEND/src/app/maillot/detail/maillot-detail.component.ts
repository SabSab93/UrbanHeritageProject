import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map }               from 'rxjs/operators';

/* Services & modèles */
import { MaillotService }    from '../maillot.service';
import { Maillot }           from '../../models/maillot.model';
import { AvisService }       from '../../services/avis.service';
import { Avis }              from '../../models/avis.model';
import { PanierService }     from '../../components/panier/panier.service';
import { PanierUiService }   from '../../components/panier/panier-sidebar.service';
import { AuthLoginService }  from '../../services/auth-service/auth-login.service';
import { PersonnalisationService } from '../../services/personnalisation.service';
import { Personnalisation }  from '../../models/personnalisation.model';
import { StockService, Disponibilite } from '../../services/stock.service';
import { ArtisteService }    from '../../artiste/artiste.service';
import { Artiste }           from '../../models/artiste.model';
import { AssociationService } from '../../association/association.service';
import { Association }                 from '../../models/association.model';  

/* Components */
import { HeaderComponent }   from '../../components/home-page/shared/header/header.component';
import { FooterComponent }   from '../../components/home-page/shared/footer/footer.component';
import { SectionArtisteComponent } from '../../artiste/section-artiste/section-artiste.component';
import { SectionAssociationComponent } from '../../association/section-association/section-association.component';


type Couleur = 'ROUGE' | 'VERT' | 'NOIR' | 'BLANC';

@Component({
  selector   : 'app-maillot-detail',
  standalone : true,
  imports    : [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    SectionArtisteComponent,
    SectionAssociationComponent
  ],
  templateUrl: './maillot-detail.component.html',
  styleUrls  : ['./maillot-detail.component.scss']
})
export class DetailComponent implements OnInit {
  /* Maillot enrichi */
  maillot?: Maillot & {
    availableSizes : string[];
    sizeQuantities : Record<string, number>;
    allOutOfStock  : boolean;
  };

  /* Artiste associé */
  artiste?: Artiste;

  association?: Association;

  /* Personnalisations */
  personalisations: Personnalisation[] = [];


  /* Avis */
  avisList     : Avis[]  = [];
  moyenneAvis  : number | null = null;
  nombreAvis   = 0;

  /* États */
  loading      = true;
  loadingAvis  = true;
  error        = '';
  errorAvis    = '';

  /* UI */
  selectedSize           : string | null = null;
  errorMessage           : string | null = null;
  selectedPersoId        : number | null = null;
  selectedPersoType      : Personnalisation['type_personnalisation'] | null = null;
  valeur_personnalisation = '';
  couleur_personnalisation: Couleur = 'NOIR';
  couleurOptions         : Couleur[] = ['ROUGE', 'VERT', 'NOIR', 'BLANC'];
  displayedPrice!        : number;
  stockThreshold         = 30;

  constructor(
    private route     : ActivatedRoute,
    private svc       : MaillotService,
    private artisteSrv: ArtisteService,
    private avisSrv   : AvisService,
    private panierSrv : PanierService,
    private panierUi  : PanierUiService,
    private authLogin : AuthLoginService,
    private persoSvc  : PersonnalisationService,
    private stockSrv  : StockService,
    private associationSrv: AssociationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    /* Charger le maillot */
    this.svc.getById(id).subscribe({
      next: m => {
        /* --------- Maillot --------- */
        this.maillot       = { ...m, availableSizes: [], sizeQuantities: {}, allOutOfStock: false };
        this.displayedPrice = Number(m.prix_ht_maillot);

        /* Charger stock */
        this.stockSrv.getDisponibilitePublic(id).pipe(
          map((liste: Disponibilite[]) => {
            const q: Record<string, number> = {};
            liste.forEach(d => (q[d.taille_maillot] = d.quantite_disponible));
            const sizes = liste.filter(d => d.quantite_disponible > 0).map(d => d.taille_maillot);
            return { availableSizes: sizes, sizeQuantities: q, allOutOfStock: sizes.length === 0 };
          })
        ).subscribe(info => Object.assign(this.maillot!, info));

        /* --------- Artiste associé --------- */
        if (m.id_artiste) {
          this.artisteSrv.getById(m.id_artiste).subscribe({
            next  : a   => this.artiste = a,
            error : ()  => console.warn('Artiste non trouvé')
          });
        }
        if (m.id_association) {
         this.associationSrv.getAssociation(m.id_association)
          .subscribe(a => this.association = a);
        }

        this.loading = false;
      },
      error: () => {
        this.error   = 'Impossible de charger ce maillot.';
        this.loading = false;
      }
    });

    /* Personnalisations */
    this.persoSvc.getAll().subscribe({
      next  : l   => this.personalisations = l,
      error : err => console.error('Erreur perso :', err)
    });

    /* Avis & stats */
    this.avisSrv.getStats(id).subscribe({
      next: s => {
        this.nombreAvis  = s.nombreAvis;
        this.moyenneAvis = +s.noteMoyenne;
        this.avisList    = s.avis;
        this.loadingAvis = false;
      },
      error: () => {
        this.errorAvis   = 'Impossible de charger les avis pour ce maillot.';
        this.loadingAvis = false;
      }
    });
  }

  /* -------------------- UI Helpers -------------------- */
  selectSize(size: string) { this.selectedSize = size; this.errorMessage = null; }

  onSelectPerso(id: number | null) {
    this.selectedPersoId   = id;
    this.valeur_personnalisation = '';
    this.couleur_personnalisation = 'NOIR';

    const p        = this.personalisations.find(x => x.id_personnalisation === id);
    this.selectedPersoType = p?.type_personnalisation ?? null;

    const base  = Number(this.maillot?.prix_ht_maillot ?? 0);
    const extra = p ? Number(p.prix_ht) : 0;
    this.displayedPrice = base + extra;
  }

  addToCart(): void {
    if (!this.selectedSize)                       { this.errorMessage = 'Merci de sélectionner une taille.'; return; }
    if (!this.maillot)                            { this.errorMessage = 'Produit introuvable.'; return; }
    if (this.maillot.allOutOfStock ||
        !this.maillot.availableSizes.includes(this.selectedSize)) { this.errorMessage = 'Taille indisponible.'; return; }
    if (this.selectedPersoId && !this.valeur_personnalisation)    { this.errorMessage = 'Merci de saisir le texte de personnalisation.'; return; }

    this.panierSrv.addLine({
      id_client   : this.authLogin.currentClientId ?? undefined,
      id_maillot  : this.maillot.id_maillot,
      taille_maillot: this.selectedSize,
      quantite    : 1,
      prix_ht     : this.displayedPrice,
      Maillot     : {
        nom_maillot: this.maillot.nom_maillot,
        url_image_maillot_1: this.maillot.url_image_maillot_1
      },
      id_personnalisation    : this.selectedPersoId,
      valeur_personnalisation: this.valeur_personnalisation || null,
      couleur_personnalisation: this.selectedPersoId ? this.couleur_personnalisation : null
    }).subscribe({
      next  : ()   => { this.errorMessage = null; this.panierUi.toggleSidebar(); },
      error : err  => console.error('Erreur addLine :', err)
    });
  }
}
