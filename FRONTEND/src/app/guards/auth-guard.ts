import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthLoginService } from '../services/auth-service/auth-login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthLoginService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.client$.pipe(
      map(client => {
        if (client) {
          return true;
        } else {
          // redirige vers connexion en gardant le returnUrl
          return this.router.createUrlTree(['/connexion'], {
            queryParams: { returnUrl: '/confirmation' }
          });
        }
      })
    );
  }
}