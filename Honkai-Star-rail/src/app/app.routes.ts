import { Routes } from '@angular/router';
import { HomeConnectorComponent } from './home/home-connector.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeConnectorComponent }, 
];
