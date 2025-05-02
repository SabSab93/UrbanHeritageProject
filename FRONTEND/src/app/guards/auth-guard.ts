import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Optionnel : décoder et vérifier l'expiration du token ici
      return true;
    }

    // Pas de token valide : redirection vers la page de connexion
    this.router.navigate(['/']);
    return false;
  }
}
