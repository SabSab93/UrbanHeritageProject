import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-section-introduction',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './section-introduction.component.html'
})
export class SectionIntroductionComponent {}
