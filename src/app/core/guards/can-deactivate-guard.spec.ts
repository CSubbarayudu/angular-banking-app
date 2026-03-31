import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { canDeactivateGuard, CanComponentDeactivate } from './can-deactivate-guard';

describe('canDeactivateGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => canDeactivateGuard(guardParameters[0] as CanComponentDeactivate, guardParameters[1], guardParameters[2], guardParameters[3]));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
