import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isPlatformBrowser(platformId) && error.error instanceof ErrorEvent) {
        // Client-side network error
        console.error('Client Error:', error.error.message);
      } else {
        // Server-side HTTP error
        console.error('Server Error:', error.status, error.message);
      }
      return throwError(() => error);
    })
  );
};