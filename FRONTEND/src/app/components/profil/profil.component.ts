import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../home-page/shared/header/header.component';
import { FooterComponent } from '../home-page/shared/footer/footer.component';
import { AuthLoginService } from '../../services/auth-service/auth-login.service';
import { Client } from '../../models/client.model';

@Component({
  selector   : 'app-profil',
  standalone : true,
  imports    : [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './profil.component.html',
  styleUrls  : ['./profil.component.scss']
})
export class ProfilComponent {
  client: Client | null = null;

  constructor(
    private router: Router,
    private authService: AuthLoginService
  ) {
    this.authService.client$.subscribe((client) => {
      this.client = client;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}