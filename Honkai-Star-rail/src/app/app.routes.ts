import { Routes } from '@angular/router';
import { HomeConnectorComponent } from './home/home-connector.component';
import { NewsComponent } from './news/news.component';
import { CharacterPageConnectorComponent } from './characterPage/characterPage-connector.component';
import { LoginConnectorComponent  } from './loginPage/login-connector/login-connector.component';
import { RegisterConnectorComponent } from './registerPage/register-connector/register-connector.component';


import { AdminConnectorComponent } from './admin/admin-connector/admin-connector.component';
import { AdminCharacters } from './admin/pages/characters/admin-characters.component';
import { AdminUsers } from './admin/pages/users/admin-users.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeConnectorComponent }, 
  { path: 'news', component: NewsComponent}, 
  { path: 'character/:id', component: CharacterPageConnectorComponent},
  { path: 'login', component: LoginConnectorComponent },
  { path: 'register', component: RegisterConnectorComponent }, 
  { 
    path: 'admin', 
    component: AdminConnectorComponent,
    children: [
      { path: 'characters', component: AdminCharacters },
      { path: 'users', component: AdminUsers }
    ]
  }
];
