import { CanDeactivateFn } from '@angular/router';

// Any component that wants guard protection must implement this interface
export interface CanComponentDeactivate {
  canDeactivate(): boolean;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component
) => {
  // If the component has a canDeactivate() method, call it
  // Otherwise, allow navigation by returning true
  if (component && typeof component.canDeactivate === 'function') {
    return component.canDeactivate();
  }
  return true;
};