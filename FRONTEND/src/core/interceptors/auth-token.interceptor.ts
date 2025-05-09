// src/app/core/interceptors/auth-token.interceptor.ts
import {
    HttpRequest,
    HttpHandlerFn,
    HttpInterceptorFn
  } from '@angular/common/http';
  
  
  
  export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.startsWith('http://localhost:1992/api/')) {
      const token = localStorage.getItem('authToken');
      console.log('[INT] appel vers API', req.url, 'token=', !!token);
      if (token) {
        req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
    }
    return next(req);
  };