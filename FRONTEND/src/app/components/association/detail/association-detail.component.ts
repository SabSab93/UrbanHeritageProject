// src/app/components/association/detail-association/detail-association.component.ts
import { Component, OnInit }             from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { ActivatedRoute, RouterModule }  from '@angular/router';
import { HeaderComponent } from '../../home-page/shared/header/header.component';
import { FooterComponent } from '../../home-page/shared/footer/footer.component';
import { AssociationService } from '../association.service';
import { Association } from '../../../models/association.model';

@Component({
  selector: 'app-association-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './association-detail.component.html',
  styleUrls: ['./association-detail.component.scss']
})
export class AssociationDetailComponent implements OnInit {
  association?: Association;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private svc: AssociationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getAssociation(id).subscribe({
      next: (a: Association) => {
        this.association = a;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger cette association';
        this.loading = false;
      }
    });
  }
}
