import { Routes } from '@angular/router';
import { HomeConnectorComponent } from './home/home-connector.component';
import { NewsComponent } from './news/news.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeConnectorComponent }, 
  { path: 'news', component: NewsComponent}, 
];
