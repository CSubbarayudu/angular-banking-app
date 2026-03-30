import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Check if authToken exists in localStorage
  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    return true;
  } else {
    // If not logged in, redirect to login page
    router.navigate(['/login']);
    return false;
  }
};