import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        let message = '';

        if (error.error instanceof ErrorEvent) {
          message = `Client Error: ${error.error.message}`;
        } else {
          message = `Server Error Code: ${error.status}`;
        }

        console.error('Secure Log:', message);

        return throwError(() =>
          new Error('Something went wrong. Please try again later.')
        );
      })
    );
  }
}