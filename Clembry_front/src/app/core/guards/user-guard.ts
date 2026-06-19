import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth-service';

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // 1. Controlliamo prima se l'utente è effettivamente loggato
  if (authService.isLoggedIn()) {
    
    // 2. Se è un docente e sta provando ad accedere all'area studenti, lo dirottiamo sulla sua area
    if (authService.getRole() === 'teacher') {
      return router.createUrlTree(["/teacherPersonalArea"]);
    }
    
    // 3. Se è loggato e non è un docente (quindi è uno studente), può passare
    return true;
  } else {
    // 4. Se non è loggato, dritto al login
    return router.createUrlTree(["/login"]);
  }
};