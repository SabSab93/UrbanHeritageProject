import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthUiService } from '../../../../services/auth-service/auth-sidebar.service';
import { ClientService } from '../../../../services/client-service/client.service';
import { AuthSidebarComponent } from '../../../auth/auth-sidebar/auth-sidebar.component';

import { Observable } from 'rxjs';
import { Client } from '../../../../models/client.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthSidebarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  activeLink = 'accueil';
  client$: Observable<Client | null>;

  constructor(
    public authUiService: AuthUiService,
    private clientService: ClientService
  ) {
    this.client$ = this.clientService.client$;
  }

  ngOnInit(): void {
    console.log("Header init – tentative de récupération client");
    this.clientService.loadClient();  // 🔁 FORCÉ ici
  }

  setActive(link: string): void {
    this.activeLink = link;
  }

  toggleAuth(): void {
    this.authUiService.toggleSidebar();
  }
}

