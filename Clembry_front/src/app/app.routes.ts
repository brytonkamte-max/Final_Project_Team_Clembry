import { Routes } from '@angular/router';
import { Homepage } from './features/homepage/homepage';
import { Courses } from './features/courses/courses';
import { Teachers } from './features/teachers/teachers';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Homepage },
  { path: 'courses', component: Courses },
  { path: 'teachers', component: Teachers },
  // { path: 'howitworks', component: Homepage },
  // { path: 'contacts', component: Homepage },
  // { path: 'about', component: Homepage },
  // { path: 'login', component: Homepage },
  // { path: 'register', component: Homepage },
];
