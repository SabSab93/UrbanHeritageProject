import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthLoginService } from '../services/auth-service/auth-login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthLoginService,
    private router: Router
  ) {}

canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean|UrlTree> {
  return this.auth.client$.pipe(
    map(client => {
      if (client) {
        return true;
      }
      return this.router.createUrlTree(['/connexion'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
}
}

