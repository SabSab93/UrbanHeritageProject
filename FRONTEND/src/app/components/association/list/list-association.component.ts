import { Component, OnInit }   from '@angular/core';
import { CommonModule }        from '@angular/common';
import { AssociationService } from '../association.service';
import { Association } from '../../../models/association.model';
import { HeaderComponent } from '../../home-page/shared/header/header.component';
import { FooterComponent } from '../../home-page/shared/footer/footer.component';
import { RouterModule }        from '@angular/router';

@Component({
  selector: 'app-list-association',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,       
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './list-association.component.html',
  styleUrls: ['./list-association.component.scss']
})
export class AssociationComponent implements OnInit {
  associations: Association[] = [];
  loading = true;
  error: string | null = null;

  constructor(private service: AssociationService) {}

  ngOnInit() {
    this.service.getAssociations().subscribe({
      next: list => {
        this.associations = list;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les associations.';
        this.loading = false;
      }
    });
  }
}
