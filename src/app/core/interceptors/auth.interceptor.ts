import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');

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