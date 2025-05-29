import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { Association }      from '../../models/association.model';

@Component({
  selector: 'app-section-association',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-association.component.html',
  styleUrls: ['./section-association.component.scss']
})
export class SectionAssociationComponent {
  /** Données de l’association à afficher */
  @Input() association!: Association;
}