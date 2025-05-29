// engagement.component.ts
import { Component } from '@angular/core';
import { FooterComponent } from '../home-page/shared/footer/footer.component';
import { HeaderComponent } from '../home-page/shared/header/header.component';

@Component({
  selector: 'app-engagement',
  imports: [HeaderComponent, FooterComponent],
  standalone: true,
  templateUrl: './engagement.component.html',
  styleUrls: ['./engagement.component.scss']
})
export class EngagementComponent { }