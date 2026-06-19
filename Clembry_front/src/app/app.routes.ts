import { Routes } from '@angular/router';
import { Homepage } from './features/homepage/homepage';
import { Login } from './features/login/login';
import { Registration } from './features/registration/registration';
import { Teachers } from './features/teachers/teachers';
import { Courses } from './features/courses/courses';
import { ContactsComponent } from './features/contacts-component/contacts-component';
import { userGuard } from './core/guards/user-guard';
import { teacherGuard } from './core/guards/teacher-guard';
import { PersonalArea } from './features/personal-area/personal-area';
import { TeacherPersonalArea } from './features/teacher-personal-area/teacher-personal-area';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Homepage },
  { path: 'courses', component: Courses },
  { path: 'teachers', component: Teachers },
  { path: 'contacts', component: ContactsComponent },
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  
  // Rotta protetta per lo Studente
  { path: 'personalArea', component: PersonalArea, canActivate: [userGuard] },
  
  // Rotta protetta per il Docente
  { path: 'teacherPersonalArea', component: TeacherPersonalArea, canActivate: [teacherGuard] },
];