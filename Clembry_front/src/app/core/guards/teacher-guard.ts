import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth-service';

export const teacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Deve essere loggato E deve avere il ruolo 'teacher'
  if (authService.isLoggedIn() && authService.getRole() === 'teacher') {
    return true;
  } else {
    // Se non ha i permessi, lo rimandiamo al login o alla home
    return router.createUrlTree(["/login"]);
  }
};