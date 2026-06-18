import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth-service';

@Component({
  selector: 'app-teacher-personal-area',
  imports: [],
  templateUrl: './teacher-personal-area.html',
  styleUrl: './teacher-personal-area.css',
})
export class TeacherPersonalArea {
  authService = inject(Auth);
  router = inject(Router);
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
