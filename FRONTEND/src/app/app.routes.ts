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
  {
    path: 'collection/maillot/:id',
    loadComponent: () =>
      import('./maillot/detail/maillot-detail.component').then(m => m.DetailComponent)
  },
  { path: 'artistes', component: ArtisteComponent },
  { path: 'artiste/:id', component: ArtisteDetailComponent },

  { path: 'associations', component: AssociationComponent },
];
