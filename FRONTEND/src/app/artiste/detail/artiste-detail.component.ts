// src/app/artiste/artiste-detail/artiste-detail.component.ts

import { Component, OnInit }           from '@angular/core';
import { CommonModule }                from '@angular/common';
import { ActivatedRoute, RouterModule }from '@angular/router';
import { HeaderComponent } from '../../components/home-page/shared/header/header.component';
import { FooterComponent } from '../../components/home-page/shared/footer/footer.component';
import { Artiste } from '../../models/artiste.model';
import { ArtisteService } from '../artiste.service';


@Component({
  selector: 'app-artiste-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './artiste-detail.component.html',
  styleUrls: ['./artiste-detail.component.scss']
})
export class ArtisteDetailComponent implements OnInit {
  artiste?: Artiste;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private svc: ArtisteService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({
      next: (a: Artiste | undefined) => {
        this.artiste = a;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger ce profil';
        this.loading = false;
      }
    });
  }
 /** URL Instagram sans le « @ » */
 get instagramUrl(): string | null {
    const handle = this.artiste?.url_instagram_reseau_social;
    if (!handle) {
      return null;
    }
    // on est sûr de ne pas être undefined ici
    const clean = handle.startsWith('@') ? handle.substring(1) : handle;
    return `https://instagram.com/${clean}`;
  }

  /** URL TikTok sans le « @ » */
  get tiktokUrl(): string | null {
    const handle = this.artiste?.url_tiktok_reseau_social;
    if (!handle) {
      return null;
    }
    const clean = handle.startsWith('@') ? handle.substring(1) : handle;
    return `https://tiktok.com/${clean}`;
  }
}
