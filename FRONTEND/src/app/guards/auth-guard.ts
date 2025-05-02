// guards/auth-guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthLoginService } from '../services/auth-service/auth-login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthLoginService, private router: Router) {}

  canActivate() {
    return this.auth.client$.pipe(
      map(client => {
        if (client) return true;
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
