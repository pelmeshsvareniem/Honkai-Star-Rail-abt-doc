import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { BodyComponent } from '../body/body.component';

@Component({
  selector: 'app-login-connector',
  template: `
    <app-header></app-header>
    <app-body></app-body>
  `,
  standalone: true,  
  imports: [
    HeaderComponent,
    BodyComponent,
  ]
})
export class LoginConnectorComponent { }

