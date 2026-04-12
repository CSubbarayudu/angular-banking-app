import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedState {
  hasUnsavedChanges: () => boolean;
}

export const unsavedFiltersGuard: CanDeactivateFn<HasUnsavedState> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return confirm('You have unsaved filter changes. Leave this page?');
};
