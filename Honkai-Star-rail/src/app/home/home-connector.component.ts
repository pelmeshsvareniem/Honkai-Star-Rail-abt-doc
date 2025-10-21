import { Component } from '@angular/core';
import { HeaderComponent } from './header/header';
import { BodyComponent } from './body/body';
import { FooterComponent } from './footer/footer';

@Component({
  selector: 'app-home-connector',
  standalone: true,
   template: `
    <app-header></app-header>
    <app-body></app-body>
    <app-footer></app-footer>
  `,
  imports: [HeaderComponent, BodyComponent, FooterComponent],
})
export class HomeConnectorComponent {}
