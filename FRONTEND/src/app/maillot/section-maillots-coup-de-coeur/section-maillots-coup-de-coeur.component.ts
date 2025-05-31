import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaillotService } from '../maillot.service';
import { Maillot } from '../../models/maillot.model';

@Component({
  selector: 'app-section-maillots-coup-de-coeur',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './section-maillots-coup-de-coeur.component.html',
  styleUrls: ['./section-maillots-coup-de-coeur.component.scss']
})
export class SectionMaillotsCoupDeCoeurComponent implements OnInit {
  maillots: Maillot[] = [];

  constructor(private maillotService: MaillotService) {}

  ngOnInit(): void {
    this.maillotService.getBestSellers(4).subscribe({
      next: data => this.maillots = data,
      error: err => console.error('Erreur chargement maillots coups de cœur', err)
    });
  }
}
