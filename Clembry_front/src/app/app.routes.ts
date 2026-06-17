import { Routes } from '@angular/router';
import { Homepage } from './features/homepage/homepage';
import { Login } from './features/login/login';
import { Registration } from './features/registration/registration';
import { Teachers } from './features/teachers/teachers';
import { Courses } from './features/courses/courses';
import { ContactsComponent } from './features/contacts-component/contacts-component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Homepage },
  { path: 'courses', component: Courses },
  { path: 'teachers', component: Teachers },
  // { path: 'howitworks', component: Homepage },
   { path: 'contacts', component: ContactsComponent },
  // { path: 'about', component: Homepage },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'personalArea', component: Homepage },
  { path: 'teacherPersonalArea', component: Homepage },
];
