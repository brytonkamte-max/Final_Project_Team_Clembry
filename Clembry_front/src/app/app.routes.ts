import { Routes } from '@angular/router';
import { Homepage } from './features/homepage/homepage';
import { Teachers } from './features/teachers/teachers';
import { Login } from './features/login/login';
import { Registration } from './features/registration/registration';
import { CoursesComponent } from './features/courses/courses';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Homepage },
  { path: 'courses', component: CoursesComponent },
  { path: 'teachers', component: Teachers },
  // { path: 'howitworks', component: Homepage },
  // { path: 'contacts', component: Homepage },
  // { path: 'about', component: Homepage },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'personalArea', component: Homepage },
  { path: 'teacherPersonalArea', component: Homepage },
];
