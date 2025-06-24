import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { AuthGuard } from './guards/auth-guard';
import { ProfilComponent } from './components/profil/profil.component';
import { AuthRegisterComponent } from './components/auth/auth-register/auth-register.component';
import { AuthLoginComponent } from './components/auth/auth-login/auth-login.component';
import { CollectionComponent } from './components/maillot/collection/collection.component';
import { ArtisteComponent } from './components/artiste/list/list-artiste.component';
import { ArtisteDetailComponent } from './components/artiste/detail/artiste-detail.component';
import { AssociationComponent } from './components/association/list/list-association.component';
import { AssociationDetailComponent } from './components/association/detail/association-detail.component';
import { ForgotPasswordComponent } from './components/auth/auth-forgot-password/auth-forgot-password.component';
import { ResetPasswordComponent } from './components/auth/auth-reset-pasword/auth-reset-password.component';
import { PaymentCancelComponent } from './components/paiement/payment-cancel.component';
import { PaymentSuccessComponent } from './components/paiement/payment-success.component';
import { AvisComponent } from './components/avis/avis.component';
import { OrderGuard } from './guards/order-guard';
import { AuthActivationComponent } from './components/auth/auth-activation/auth-activation.component';
import { EngagementComponent } from './components/engagement/engagement.component';

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
  { path: 'engagements', component: EngagementComponent },
  { path: 'collection', component: CollectionComponent },
  {
    path: 'collection/maillot/:id',
    loadComponent: () =>
      import('./components/maillot/detail/maillot-detail.component').then(m => m.DetailComponent)
  },

  { path: 'artistes', component: ArtisteComponent },
  { path: 'artiste/:id', component: ArtisteDetailComponent },
  { path: 'associations', component: AssociationComponent },
  { path: 'association/:id', component: AssociationDetailComponent },
  { path: 'forgot-password',  component: ForgotPasswordComponent },
  { path: 'reset-password',   component: ResetPasswordComponent },
  { path: 'paiement/success', component: PaymentSuccessComponent, canActivate: [AuthGuard] },
  { path: 'paiement/cancel',  component: PaymentCancelComponent, canActivate: [AuthGuard] },
  {
  path: 'maillot/:id/avis',
  component: AvisComponent,
  canActivate: [AuthGuard, OrderGuard]
},
 { path: 'activation', component:AuthActivationComponent },
        
  { path: '', component: HomePageComponent }
];







// export const routes: Routes = [
//   { path: '', component: HomePageComponent },
//   { path: 'collection', component: CollectionComponent },
//   { path: 'artistes', component: ArtisteComponent },
//   { path: 'associations', component: AssociationComponent },
//   { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
//   { path: 'inscription', component: AuthRegisterComponent },
//   { path: 'connexion', component: AuthLoginComponent },

//   {
//     path: 'collection/maillot/:id',
//     loadComponent: () =>
//       import('./components/maillot/detail/maillot-detail.component')
//         .then(m => m.DetailComponent)
//   },
//   {
//     path: 'activation',
//     loadComponent: () =>
//       import('./components/auth/auth-activation/auth-activation.component')
//         .then(m => m.AuthActivationComponent)
//   },
//   {
//     path: 'forgot-password',
//     loadComponent: () =>
//       import('./components/auth/auth-forgot-password/auth-forgot-password.component')
//         .then(m => m.ForgotPasswordComponent)
//   },
//   {
//     path: 'confirmation',
//     loadComponent: () =>
//       import('./components/confirmation/confirmation.component')
//         .then(m => m.ConfirmationComponent),
//     canActivate: [AuthGuard]
//   },
//   {
//     path: 'paiement/success',
//     loadComponent: () =>
//       import('./components/paiement/payment-success.component')
//         .then(m => m.PaymentSuccessComponent),
//     canActivate: [AuthGuard]
//   },

//   { path: '**', redirectTo: '' }
// ];




