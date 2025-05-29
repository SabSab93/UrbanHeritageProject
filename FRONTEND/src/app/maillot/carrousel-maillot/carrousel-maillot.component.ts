import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { RouterModule }     from '@angular/router';
import { Maillot }          from '../../models/maillot.model';

@Component({
  selector: 'app-carrousel-maillot',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrousel-maillot.component.html',
  styleUrls: ['./carrousel-maillot.component.scss']
})
export class CarrouselMaillotComponent {
  /** Les maillots à afficher */
  @Input() maillots: Maillot[] = [];
  /** Nom de l’artiste pour le titre */
  @Input() artisteName = '';
}
