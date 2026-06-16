import { Routes } from '@angular/router';
import { Homepage } from './features/homepage/homepage';
import { Courses } from './features/courses/courses';
import { Teachers } from './features/teachers/teachers';
import { Login } from './features/login/login';
import { Registration } from './features/registration/registration';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Homepage },
  { path: 'courses', component: Courses },
  { path: 'teachers', component: Teachers },
  // { path: 'howitworks', component: Homepage },
  // { path: 'contacts', component: Homepage },
  // { path: 'about', component: Homepage },
  { path: 'login', component: Login },
  { path: 'register', component: Registration },
];
