import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { PanierService }   from '../panier/panier.service';
import { CommandeService } from '../../services/commande.service';
import { StockService, Disponibilite } from '../../services/stock.service';
import { AuthLoginService } from '../../services/auth-service/auth-login.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
    FooterComponent
  ],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  panier: any[] = [];
  private idClient!: number;
  stockErrors: (string | null)[] = [];
  totalHt = 0;
  totalTtc = 0;
  discount = 0;
  promoMessage = '';

  shippingMethodCost = 0;
  shippingLieuCost   = 0;
  shippingCostTtc    = 0;
  finalTotal = 0;

  methodes: MethodeLivraison[] = [];
  lieux:    LieuLivraison[]    = [];
  livreurs: Livreur[]          = [];

  confirmForm: FormGroup;
  stockWarning = '';
  rupturedLines = new Set<number>();

  private activeReductions: Reduction[] = [];
  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private panierSrv: PanierService,
    private cmdSrv: CommandeService,
    private stockSrv: StockService,
    private auth: AuthLoginService,
    private http: HttpClient
  ) {
    this.confirmForm = this.fb.group({
      reduction:             [''],
      useClientAddress:      [true, Validators.required],
      adresse_livraison:     [''],
      code_postal_livraison: [''],
      ville_livraison:       [''],
      pays_livraison:        [''],
      methode:               [null as MethodeLivraison | null, Validators.required],
      lieu:                  [null as LieuLivraison    | null, Validators.required],
      id_livreur:            [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.idClient = this.auth.currentClientId!;
    this.loadCart();

    this.subs.add(
      this.cmdSrv.getActiveReductions().subscribe(list => {
        this.activeReductions = list;
      })
    );
    this.subs.add(
      this.cmdSrv.getMethodesLivraison().subscribe(m => this.methodes = m)
    );
    this.subs.add(
      this.cmdSrv.getLieuxLivraison().subscribe(l => this.lieux = l)
    );
    this.subs.add(
      this.cmdSrv.getLivreurs().subscribe(r => this.livreurs = r)
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadCart(): void {
    this.subs.add(
      this.panierSrv.getCartLines(this.idClient).subscribe(lines => {
        this.panier = lines;
        this.totalHt  = lines.reduce((s, l) => s + l.prix_ht * l.quantite, 0);
        this.totalTtc = lines.reduce(
          (s, l) => s + l.prix_ht * l.quantite * (1 + l.TVA.taux_tva / 100),
          0
        );
        this.recalculate();
      })
    );
  }

  public removeLine(itemId: number): void {
    this.subs.add(
      this.panierSrv.removeLine(this.idClient, itemId).subscribe({
        next: () => this.loadCart(),
        error: err => console.error('Erreur suppression ligne', err)
      })
    );
  }

  public recalculate(): void {
    const produitsNetTtc = Math.max(0, this.totalTtc - this.discount);
    const m = this.confirmForm.value.methode as MethodeLivraison | null;
    const l = this.confirmForm.value.lieu    as LieuLivraison    | null;

    this.shippingMethodCost = Number(m?.prix_methode ?? 0);
    this.shippingLieuCost   = Number(l?.prix_lieu   ?? 0);
    this.shippingCostTtc    = this.shippingMethodCost + this.shippingLieuCost;
    this.finalTotal         = produitsNetTtc + this.shippingCostTtc;
  }

  public applyPromo(): void {
    const code = (this.confirmForm.value.reduction || '').trim().toUpperCase();
    const now  = new Date();
    const red = this.activeReductions.find(r => {
      if (!r.date_debut_reduction || !r.date_fin_reduction) return false;
      const start = new Date(r.date_debut_reduction), end = new Date(r.date_fin_reduction);
      return r.code_reduction.toUpperCase() === code && start <= now && end >= now;
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

  public onSubmit(): void {
    this.confirmForm.markAllAsTouched();
    if (this.confirmForm.invalid) return;

    // Vérification stock
    const checks = this.panier.map(item => {
      const idMaillot = item.Maillot.id_maillot;
      const taille = item.taille_maillot;
      return this.stockSrv.getDisponibilitePublic(idMaillot).pipe(
        map((list: Disponibilite[]) => {
          const dispo = list.find(d => d.taille_maillot === taille)?.quantite_disponible ?? 0;
          return dispo < item.quantite
            ? `${item.Maillot.nom_maillot} (taille ${taille}) : il reste ${dispo}`
            : null;
        }),
        catchError(() => of(
          `Impossible de vérifier le stock pour ${item.Maillot.nom_maillot}`
        ))
      );
    });

    forkJoin(checks).pipe(
      switchMap(results => {
        this.stockErrors = results;
        const errors = results.filter(r => !!r) as string[];
        if (errors.length) {
          this.stockWarning = '⚠️ Il y a une rupture de stock sur certains articles.';
          return of(null);
        }
        this.stockWarning = '';
        // Finaliser commande puis redirection Stripe
        return this.cmdSrv.finaliserCommande({
          ...this.confirmForm.value,
          id_methode_livraison: this.confirmForm.value.methode.id_methode_livraison,
          id_lieu_livraison:    this.confirmForm.value.lieu.id_lieu_livraison,
          id_livreur:           this.confirmForm.value.id_livreur,
          reduction: this.discount > 0 ? this.confirmForm.value.reduction : null
        });
      })
    ).subscribe(res => {
      if (!res) return;
      const orderId = res.commande.id_commande;
      // Appel Stripe
      this.http.post<{ url: string }>(
        `${environment.apiUrl}/stripe/create-checkout-session/${orderId}`,
        {}
      ).subscribe(
        ({ url }) => window.location.href = url,
        err => console.error('Erreur session Stripe', err)
      );
    });
  }
}
