// src/app/maillot/collection/collection.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';

import { MaillotService }    from '../maillot.service';
import { Maillot }          from '../maillot.service';

import { HeaderComponent }   from '../../components/home-page/shared/header/header.component';
import { FooterComponent }   from '../../components/home-page/shared/footer/footer.component';

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
  maillots: Maillot[] = [];  // ↖️ typage fort
  loading  = true;
  error    = '';
  filter   = 'all';

  constructor(private svc: MaillotService) {}

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: (data: Maillot[]) => {
        this.maillots = data;
        this.loading  = false;
      },
      error: () => {
        this.error   = 'Impossible de charger la collection';
        this.loading = false;
      }
    });
  }
  filterList = [
    { key: 'all',      label: 'Afficher tout' },
    { key: 'longues',  label: 'Longues' },
    { key: 'mini',     label: 'Mini' },
    { key: 'denim',    label: 'Denim' }
  ];
  matchesFilter(m: Maillot, filter: string): boolean {

    return true;
  }
}
