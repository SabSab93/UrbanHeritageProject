// src/app/maillot.module.ts  (ou app.module.ts)
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule }  from '@angular/router';
import { routes } from '../app.routes';
import { AppComponent } from '../app.component';

@NgModule({
  // ⚠️ NE PAS déclarer AppComponent
  // declarations: [],

  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    AppComponent            
  ],


})
export class MaillotModule {}
