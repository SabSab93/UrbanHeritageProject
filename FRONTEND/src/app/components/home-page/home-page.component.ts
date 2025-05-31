import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SectionEngagementsComponent } from './sections/section-engagements/section-engagements.component';
import { SectionIntroductionComponent } from './sections/section-introduction/section-introduction.component';
import { SectionAProposComponent } from './sections/section-a-propos/section-a-propos.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AuthUiService } from '../../services/auth-service/auth-sidebar.service';
import { BannerComponent } from './banner/banner.component';
import { SectionMaillotsCoupDeCoeurComponent } from '../../maillot/section-maillots-coup-de-coeur/section-maillots-coup-de-coeur.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, BannerComponent, SectionEngagementsComponent,SectionIntroductionComponent,SectionAProposComponent, SectionMaillotsCoupDeCoeurComponent, FooterComponent],
  templateUrl: './home-page.component.html'

})
export class HomePageComponent {
  constructor(public authUiService: AuthUiService) {}
}