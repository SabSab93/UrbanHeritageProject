import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '../home-page/shared/footer/footer.component';
import { HeaderComponent } from '../home-page/shared/header/header.component';



@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent {
  constructor(
    private router: Router
  ) {}

  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/']);
  }
}
