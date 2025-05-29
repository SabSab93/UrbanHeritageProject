import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { Artiste } from '../../models/artiste.model';

@Component({
  selector: 'app-section-artiste',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-artiste.component.html',
  styleUrls: ['./section-artiste.component.scss']
})
export class SectionArtisteComponent  {

  @Input() artiste!: Artiste;
}
