import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { Reduction } from '../../../models/reduction.model';
import { ReductionService } from '../../../services/reduction.service';


@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './banner.component.html',
  styleUrls:  ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
  reductions: Reduction[] = [];

  constructor(private reductionService: ReductionService) {}

  ngOnInit() {
    this.reductionService.getActiveReductions().subscribe({
      next: list => this.reductions = list,
      error: err =>    console.error('Erreur bannière :', err)
    });
  }
}