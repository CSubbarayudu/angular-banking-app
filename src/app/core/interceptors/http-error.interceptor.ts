import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

// Inside your catchError block, replace:
// if (error instanceof ErrorEvent) { ... }

// With this safe check:
const platformId = inject(PLATFORM_ID);
if (isPlatformBrowser(platformId) && typeof ErrorEvent !== 'undefined' && error instanceof ErrorEvent) {
  // client-side network error
  console.error('Client Error:', error.message);
} else {
  // server-side or HTTP error
  console.error('Server Error:', error.status, error.message);
}