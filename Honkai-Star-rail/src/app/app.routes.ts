import { Routes } from '@angular/router';
import { HomeConnectorComponent } from './home/home-connector.component';
import { NewsComponent } from './news/news.component';
import { CharacterPageConnectorComponent } from './characterPage/characterPage-connector.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeConnectorComponent }, 
  { path: 'news', component: NewsComponent}, 
  { path: 'character/:id', component: CharacterPageConnectorComponent}
];
