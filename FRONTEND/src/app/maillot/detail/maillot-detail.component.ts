import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaillotService } from '../maillot.service';
import { HeaderComponent } from '../../components/home-page/shared/header/header.component';
import { FooterComponent } from '../../components/home-page/shared/footer/footer.component';
import { Maillot } from '../../models/maillot.model';
import { PanierService } from '../../components/panier/panier.service';
import { PanierUiService } from '../../components/panier/panier-sidebar.service';
import { AuthLoginService } from '../../services/auth-service/auth-login.service';

@Component({
  selector: 'app-maillot-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './maillot-detail.component.html',
  styleUrls: ['./maillot-detail.component.scss']
})
export class DetailComponent implements OnInit {
  maillot?: Maillot;
  loading = true;
  error = '';
  selectedSize: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private svc: MaillotService,
    private panierSrv: PanierService,
    private panierUi: PanierUiService,
    private authLogin: AuthLoginService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({
      next: m => {
        this.maillot = m;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger ce maillot';
        this.loading = false;
      }
    });
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  addToCart(): void {
    if (!this.maillot || !this.selectedSize) return;

    const id_client = this.authLogin.currentClientId;
    this.panierSrv.addLine({
      id_client: id_client ?? undefined,
      id_maillot: this.maillot.id_maillot,
      taille_maillot: this.selectedSize,
      quantite: 1,
      prix_ht: this.maillot.prix_ht_maillot,
      Maillot: {
        nom_maillot: this.maillot.nom_maillot,
        url_image_maillot_1: this.maillot.url_image_maillot_1
      }
    }).subscribe(() => {
      this.panierUi.toggleSidebar();
    });
  }
}

