import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUiService } from '../../../../services/auth/auth-sidebar.service';
import { Client } from '../../../../models/client.model';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth-service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  activeLink = 'accueil';
  client$: Observable<Client | null>;

  constructor(
    public authUiService: AuthUiService,
    public authService: AuthService
  ) {
    this.client$ = this.authService.client$;
  }


  setActive(link: string) {
    this.activeLink = link;
  }

  toggleAuth() {
    this.authUiService.toggleSidebar();
  }
}
