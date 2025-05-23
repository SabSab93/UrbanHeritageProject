// order-guard.ts
import { Injectable }   from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable, of }   from 'rxjs';
import { map, catchError }  from 'rxjs/operators';
import { AuthLoginService }  from '../services/auth-service/auth-login.service';
import { CommandeService }   from '../services/commande.service';

@Injectable({ providedIn: 'root' })
export class OrderGuard implements CanActivate {
  constructor(
    private auth: AuthLoginService,
    private commande: CommandeService,
    private router: Router
  ) {}

 canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean|UrlTree> {
  // 1) On est déjà passé par AuthGuard => currentClientId non null
  const maillotId = Number(route.paramMap.get('id'));

  return this.commande.hasReceivedMaillot(maillotId).pipe(
    map(authorized => {
      if (authorized) return true;
      // sinon on renvoie au profil (ou 404)
      return this.router.createUrlTree(['/profil']);
    }),
    catchError(() =>
      of(this.router.createUrlTree(['/profil']))
    )
  );
}
}
