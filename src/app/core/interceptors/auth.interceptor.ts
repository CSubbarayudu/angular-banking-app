import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  const token = isPlatformBrowser(platformId)
    ? localStorage.getItem('authToken')
    : null;

  if (token) {
    const finalToken = token.startsWith('Bearer') ? token : `Bearer ${token}`;

    const clonedReq = req.clone({
      setHeaders: {
        Authorization: finalToken
      }
    });

    return next(clonedReq);
  }

  return next(req);
};