import { Component, OnInit }   from '@angular/core';
import { CommonModule }        from '@angular/common';
import { ActivatedRoute, RouterModule }      from '@angular/router';
import { MaillotService }      from '../maillot.service';
import { HeaderComponent } from '../../components/home-page/shared/header/header.component';
import { FooterComponent } from '../../components/home-page/shared/footer/footer.component';
import { Maillot } from '../../models/maillot.model';

@Component({
  selector: 'app-maillot-detail',
  standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      HeaderComponent,
      FooterComponent
    ],
  templateUrl: './maillot-detail.component.html',
  styleUrls: ['./maillot-detail.component.scss']
})
export class DetailComponent implements OnInit {
  maillot?: Maillot;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private svc: MaillotService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({
      next: m => {
        this.maillot = m;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger ce maillot';
        this.loading = false;
      }
    });
  }
}
