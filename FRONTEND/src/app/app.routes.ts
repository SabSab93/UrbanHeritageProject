import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { AuthGuard } from './guards/auth-guard';
import { ProfilComponent } from './components/profil/profil.component';
import { AuthRegisterComponent } from './components/auth/auth-register/auth-register.component';
import { AuthLoginComponent } from './components/auth/auth-login/auth-login.component';
import { CollectionComponent } from './maillot/collection/collection.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: 'inscription', component: AuthRegisterComponent },
  { path: 'connexion', component: AuthLoginComponent },
  {
    path: 'activation',
    loadComponent: () =>
      import('./components/auth/activation/activation.component').then(
        (m) => m.ActivationComponent
      ),
  },
  { path: 'collection', component: CollectionComponent },
];
