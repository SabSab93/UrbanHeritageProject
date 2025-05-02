import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { AuthGuard } from './guards/auth-guard';
import { ProfilComponent } from './components/profil/profil.component';
import { AuthRegisterComponent } from './components/auth/auth-register/auth-register.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
    { path: 'inscription', component: AuthRegisterComponent }
  ];
