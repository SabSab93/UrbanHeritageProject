import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { AuthGuard } from './guards/auth-guard';
import { ProfilComponent } from './components/profil/profil.component';
import { AuthRegisterComponent } from './components/auth/auth-register/auth-register.component';
import { AuthLoginComponent } from './components/auth/auth-login/auth-login.component';
import { CollectionComponent } from './maillot/collection/collection.component';
import { ArtisteComponent } from './artiste/list/list-artiste.component';
import { ArtisteDetailComponent } from './artiste/detail/artiste-detail.component';
import { AssociationComponent } from './association/list/list-association.component';
import { AssociationDetailComponent } from './association/detail/association-detail.component';
import { ForgotPasswordComponent } from './components/auth/auth-forgot-password/auth-forgot-password.component';
import { ResetPasswordComponent } from './components/auth/auth-reset-pasword/auth-reset-password.component';

export const routes: Routes = [
  // {path: 'admin',canActivate: [AuthGuard] , children: import('./ADMIN/index.router').then(m => m.ADMIN_ROUTES)},
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: 'inscription', component: AuthRegisterComponent },
  { path: 'connexion', component: AuthLoginComponent },
  {
    path: 'confirmation',
    loadComponent: () =>
      import('./components/confirmation/confirmation.component')
        .then(m => m.ConfirmationComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./components/confirmation/confirmation.component')
      .then(m => m.ConfirmationComponent),
    canActivate: [AuthGuard]
  },
  { path: 'collection', component: CollectionComponent },
  {
    path: 'collection/maillot/:id',
    loadComponent: () =>
      import('./maillot/detail/maillot-detail.component').then(m => m.DetailComponent)
  },
  { path: 'artistes', component: ArtisteComponent },
  { path: 'artiste/:id', component: ArtisteDetailComponent },

  { path: 'associations', component: AssociationComponent },
  { path: 'association/:id', component: AssociationDetailComponent },
  { path: 'forgot-password',  component: ForgotPasswordComponent },
  { path: 'reset-password',   component: ResetPasswordComponent },
  { path: '', component: HomePageComponent }
];
