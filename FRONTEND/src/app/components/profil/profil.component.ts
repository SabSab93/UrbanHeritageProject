import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../home-page/shared/header/header.component';
import { FooterComponent } from '../home-page/shared/footer/footer.component';
import { AuthLoginService } from '../../services/auth-service/auth-login.service';
import { Client } from '../../models/client.model';
import { DonneesPersonnellesComponent } from './section-profil-donnee-personnelle/donnees-personnelles.component';
import { MesCommandesComponent } from './section-profil-commandes/mes-commandes/mes-commandes.component';
import { MesFacturesComponent } from './section-profil-facture/mes-factures/mes-factures.component';


@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    DonneesPersonnellesComponent,
    MesCommandesComponent,
    MesFacturesComponent
    
  ],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent {
  client: Client | null = null;
  selected: 'achats' | 'donnees' | 'factures' = 'achats';

  constructor(
    private auth: AuthLoginService
  ) {
    this.auth.client$.subscribe(c => this.client = c);
  }

  select(section: 'achats' | 'donnees' | 'factures') {
    this.selected = section;
  }

  logout() {
    this.auth.logout();
  }
}
