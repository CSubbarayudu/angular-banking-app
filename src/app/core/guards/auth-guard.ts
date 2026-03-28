import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Mock authentication check - in a real app, this would check a token service
  const useraccess = true; 

  if (useraccess) {
    return true;
  } else {
    // If not logged in, redirect to a hypothetical login page
    // router.navigate(['/login']);
    return false;
  }
};