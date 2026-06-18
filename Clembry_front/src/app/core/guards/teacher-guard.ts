import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth-service';


export const teacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth)
  const router = inject(Router)

   if (authService.isLoggedIn()) {
    return true;
  } else {
    return router.createUrlTree(["/login"]);
  }
};
