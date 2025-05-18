import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;
  if (req.url.startsWith(apiUrl)) {
    const token = localStorage.getItem('authToken');
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }
  return next(req);
};