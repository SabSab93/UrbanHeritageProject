import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SectionEngagementsComponent } from './sections/section-engagements/section-engagements.component';
import { SectionIntroductionComponent } from './sections/section-introduction/section-introduction.component';
import { SectionAProposComponent } from './sections/section-a-propos/section-a-propos.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AuthSidebarComponent } from '../auth/auth-sidebar/auth-sidebar.component';
import { AuthUiService } from '../../services/auth-service/auth-sidebar.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SectionEngagementsComponent,SectionIntroductionComponent,SectionAProposComponent, FooterComponent, AuthSidebarComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  constructor(public authUiService: AuthUiService) {}
}