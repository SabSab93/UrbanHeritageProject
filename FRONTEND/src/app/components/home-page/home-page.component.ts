import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SectionEngagementsComponent } from './sections/section-engagements/section-engagements.component';
import { SectionIntroductionComponent } from './sections/section-introduction/section-introduction.component';
import { SectionAProposComponent } from './sections/section-a-propos/section-a-propos.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, SectionEngagementsComponent,SectionIntroductionComponent,SectionAProposComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {}