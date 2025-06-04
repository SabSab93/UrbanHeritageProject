import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { Association }      from '../../../models/association.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-section-association',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './section-association.component.html',
  styleUrls: ['./section-association.component.scss']
})
export class SectionAssociationComponent {
  @Input() association!: Association;
}