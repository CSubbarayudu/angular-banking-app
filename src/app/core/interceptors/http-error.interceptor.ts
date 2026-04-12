import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong. Please try again.';

      if (error.status === 0) {
        message = 'Network issue or timeout. Please check your connection.';
      } else if (error.status >= 500) {
        message = 'Server is temporarily unavailable. Please try again shortly.';
      } else if (error.status === 401 || error.status === 403) {
        message = 'Your session expired. Please login again.';
      } else if (error.status >= 400) {
        message = 'Unable to process your request right now.';
      }

      return throwError(() => new Error(message));
    })
  );
};
