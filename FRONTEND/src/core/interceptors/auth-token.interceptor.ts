import { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  // On ne touche qu’aux requêtes vers notre API
  if (req.url.startsWith(environment.apiUrl)) {
    const token = localStorage.getItem('authToken');
    console.log('[INT] appel vers API', req.url, 'token=', !!token);
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  return next(req);
};