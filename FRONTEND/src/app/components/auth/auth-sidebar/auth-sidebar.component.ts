import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-sidebar.service';


@Component({
  selector: 'app-auth-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-sidebar.component.html',
  styleUrls: ['./auth-sidebar.component.scss']
})
export class AuthSidebarComponent {
  constructor(public authService: AuthService) {}
}