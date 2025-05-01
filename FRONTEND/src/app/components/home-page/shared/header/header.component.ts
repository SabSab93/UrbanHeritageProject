import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth-sidebar.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  activeLink = 'accueil';

  constructor(public authService: AuthService) {}  // ✅ placé à l'intérieur

  setActive(link: string) {
    this.activeLink = link;
  }

  toggleAuth() {
    this.authService.toggleSidebar();
  }
}
