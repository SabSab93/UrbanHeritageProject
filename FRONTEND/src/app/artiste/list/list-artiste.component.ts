
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { Artiste }           from '../../models/artiste.model';
import { ArtisteService } from '../artiste.service';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/home-page/shared/header/header.component';
import { FooterComponent } from '../../components/home-page/shared/footer/footer.component';

@Component({
  selector: 'app-artiste-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './list-artiste.component.html',
  styleUrls: ['./list-artiste.component.scss']
})
export class ArtisteComponent implements OnInit {
  artistes: Artiste[] = [];
  loading  = true;
  error    = '';

  constructor(private svc: ArtisteService) {}

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: data  => {
        this.artistes = data;
        this.loading  = false;
      },
      error: ()    => {
        this.error   = 'Impossible de charger les artistes';
        this.loading = false;
      }
    });
  }
}
