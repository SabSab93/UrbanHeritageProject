
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';


import { PanierService }   from '../panier/panier.service';
import { CommandeService } from '../../services/commande.service';
import { StockService, Disponibilite } from '../../services/stock.service';
import { AuthLoginService } from '../../services/auth-service/auth-login.service';


import { MethodeLivraison } from '../../models/methode-livraison.model';
import { LieuLivraison }    from '../../models/lieu-livraison.model';
import { Livreur }          from '../../models/livreur.model';
import { Reduction }        from '../../models/reduction.model';


import { HeaderComponent } from '../home-page/shared/header/header.component';
import { BannerComponent } from '../home-page/banner/banner.component';
import { FooterComponent } from '../home-page/shared/footer/footer.component';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    BannerComponent,
    FooterComponent,
  ],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  /* ---------- état panier ---------- */
  panier: any[] = [];
  private idClient!: number;

  /* ---------- totaux ---------- */
  totalHt = 0;
  totalTtc = 0;
  discount = 0;
  promoMessage = '';
  shippingMethodCost = 0;
  shippingLieuCost   = 0;
  shippingCostTtc    = 0;
  finalTotal = 0;

  /* ---------- référentiels ---------- */
  methodes:  MethodeLivraison[] = [];
  lieux:     LieuLivraison[]    = [];
  livreurs:  Livreur[]          = [];
  activeReductions: Reduction[] = [];

  /* ---------- stock ---------- */
  stockErrors: (string|null)[] = [];
  stockWarning = '';

  /* ---------- formulaire ---------- */
  confirmForm: FormGroup;

  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private panierSrv: PanierService,
    private cmdSrv: CommandeService,
    private stockSrv: StockService,
    private auth: AuthLoginService,
  ) {
    /* un seul FormGroup */
    this.confirmForm = this.fb.group({
      useClientAddress:      [true, Validators.required],
      adresse_livraison:     [''],
      code_postal_livraison: [''],
      ville_livraison:       [''],
      pays_livraison:        [''],
      methode:               [null as MethodeLivraison|null, Validators.required],
      lieu:                  [null as LieuLivraison   |null, Validators.required],
      id_livreur:            [null, Validators.required],
      reduction:             [''],
    });
  }

  /* =======================================================
     1. Init + destruction
     ======================================================= */
  ngOnInit(): void {
    /* ID client depuis le service d’auth */
    this.idClient = this.auth.currentClientId ?? 0;

    /* panier */
    this.loadCart();

    /* référentiels livraison + réductions */
    this.subs.add(
      forkJoin({
        m: this.cmdSrv.getMethodesLivraison(),
        l: this.cmdSrv.getLieuxLivraison(),
        v: this.cmdSrv.getLivreurs(),
        r: this.cmdSrv.getActiveReductions(),
      }).subscribe(({ m, l, v, r }) => {
        this.methodes        = m;
        this.lieux           = l;
        this.livreurs        = v;
        this.activeReductions = r;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /* =======================================================
     2. Panier & totaux
     ======================================================= */
  private loadCart(): void {
    this.subs.add(
      this.panierSrv.getCartLines(this.idClient).subscribe(lines => {
        this.panier = lines;
        this.totalHt  = lines.reduce((s,l) => s + l.prix_ht * l.quantite, 0);
        this.totalTtc = lines.reduce((s,l) => s + l.prix_ht * l.quantite * (1 + l.TVA.taux_tva/100), 0);
        this.recalculate();
      })
    );
  }

  removeLine(itemId: number): void {
    this.subs.add(
      this.panierSrv.removeLine(this.idClient, itemId).subscribe({
        next: () => this.loadCart(),
        error: err => console.error('Erreur suppression ligne', err),
      })
    );
  }

  recalculate(): void {
    const netProduitsTtc = Math.max(0, this.totalTtc - this.discount);
    const m = this.confirmForm.value.methode as MethodeLivraison | null;
    const l = this.confirmForm.value.lieu    as LieuLivraison    | null;

    this.shippingMethodCost = Number(m?.prix_methode ?? 0);
    this.shippingLieuCost   = Number(l?.prix_lieu   ?? 0);
    this.shippingCostTtc    = this.shippingMethodCost + this.shippingLieuCost;
    this.finalTotal         = netProduitsTtc + this.shippingCostTtc;
  }

  /* =======================================================
     3. Code promo
     ======================================================= */
  applyPromo(): void {
    const code = (this.confirmForm.value.reduction || '').trim().toUpperCase();
    const now  = new Date();

    const red = this.activeReductions.find(r => {
      if (!r.date_debut_reduction || !r.date_fin_reduction) return false;
      return (
        r.code_reduction.toUpperCase() === code &&
        new Date(r.date_debut_reduction) <= now &&
        new Date(r.date_fin_reduction)   >= now
      );
    });

    if (!red) {
      this.discount = 0;
      this.promoMessage = 'Code invalide ou expiré';
    } else {
      const val = Number(red.valeur_reduction);
      this.discount = red.type_reduction === 'pourcentage'
        ? this.totalTtc * val / 100
        : val;
      this.promoMessage = `Réduction appliquée : ${red.valeur_reduction}${red.type_reduction === 'pourcentage' ? '%' : '€'}`;
    }
    this.recalculate();
  }

  /* =======================================================
     4. Validation + paiement Stripe
     ======================================================= */
  onSubmit(): void {
    this.confirmForm.markAllAsTouched();
    if (this.confirmForm.invalid) return;

    /* 1️⃣ Vérifier le stock */
    const checks = this.panier.map(item =>
      this.stockSrv.getDisponibilitePublic(item.Maillot.id_maillot).pipe(
        map((list: Disponibilite[]) => {
          const dispo = list.find(d => d.taille_maillot === item.taille_maillot)?.quantite_disponible || 0;
          return dispo < item.quantite
            ? `${item.Maillot.nom_maillot} (taille ${item.taille_maillot}) : il reste ${dispo}`
            : null;
        }),
        catchError(() => of(`Impossible de vérifier le stock pour ${item.Maillot.nom_maillot}`))
      )
    );

    forkJoin(checks).pipe(
      switchMap(errs => {
        this.stockErrors = errs;
        if (errs.some(e => !!e)) {
          this.stockWarning = '⚠️ Rupture de stock détectée';
          return of(null);
        }
        this.stockWarning = '';

        /* 2️⃣ Finaliser la commande — un seul appel backend */
        const f = this.confirmForm.value;
        return this.cmdSrv.finaliserCommande({
          useClientAddress: f.useClientAddress,
          adresse_livraison:       f.useClientAddress ? undefined : f.adresse_livraison,
          code_postal_livraison:   f.useClientAddress ? undefined : f.code_postal_livraison,
          ville_livraison:         f.useClientAddress ? undefined : f.ville_livraison,
          pays_livraison:          f.useClientAddress ? undefined : f.pays_livraison,
          id_methode_livraison:    f.methode!.id_methode_livraison,
          id_lieu_livraison:       f.lieu!.id_lieu_livraison,
          id_livreur:              Number(f.id_livreur),
        });
      }),
      /* 3️⃣ Créer la session Stripe */
      switchMap(resp => {
        if (!resp) return of(null);
        const idCommande = resp.commande.id_commande;
        return this.cmdSrv.createCheckoutSessionByOrder(idCommande);
      })
    ).subscribe({
      next: stripeRes => {
        if (stripeRes) {
          /* redirection Stripe */
          window.location.href = stripeRes.url;
        }
      },
      error: err => {
        console.error('Impossible de lancer le paiement Stripe.', err);
        this.stockWarning = err.error?.details || 'Erreur lors de la création de la commande.';
      }
    });
  }
}
