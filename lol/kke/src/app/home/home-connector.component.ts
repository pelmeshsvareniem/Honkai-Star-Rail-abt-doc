import { Component } from '@angular/core';
import { HeaderComponent } from './header/home-header.component';
import { BodyComponent } from './body/home-body.component';
import { FooterComponent } from './footer/home-footer.component';


@Component({
  selector: 'app-home-connector',
  template: `
    <app-header></app-header>
    <app-body></app-body>
    <app-footer></app-footer>
  `,
  standalone: true,
  imports: [
    HeaderComponent,
    BodyComponent,
    FooterComponent
  ]
})
export class HomeConnectorComponent {}

