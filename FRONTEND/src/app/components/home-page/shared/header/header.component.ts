import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Observable } from 'rxjs';
import { AuthUiService } from '../../../../services/auth-service/auth-sidebar.service';
import { AuthSidebarComponent } from '../../../auth/auth-sidebar/auth-sidebar.component';
import { AuthLoginService } from '../../../../services/auth-service/auth-login.service';
import { Client } from '../../../../models/client.model';
import { PanierUiService } from '../../../panier/panier-sidebar.service';
import { PanierSidebarComponent } from '../../../panier/panier-sidebar.component';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthSidebarComponent,PanierSidebarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  activeLink = 'accueil';
  client$: Observable<Client | null>;

  constructor(
    public authUiService: AuthUiService,
    private authLogin: AuthLoginService,
    public panierUi: PanierUiService
  ) {
    this.client$ = this.authLogin.client$;   
  }

  setActive(link: string) {
    this.activeLink = link;
  }

  toggleAuth() {
    this.authUiService.toggleSidebar();
  }
}

