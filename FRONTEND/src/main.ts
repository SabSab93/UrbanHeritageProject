
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }         from './app/app.component';
import { provideHttpClient, withInterceptors }    from '@angular/common/http';
import { provideRouter }        from '@angular/router';
import { routes }               from './app/app.routes';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';

registerLocaleData(localeFr);

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([ authTokenInterceptor ])
    ),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
})
.catch(err => console.error(err));
