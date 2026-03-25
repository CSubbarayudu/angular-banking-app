import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsContainer } from './accounts-container.component';

describe('AccountsContainer', () => {
  let component: AccountsContainer;
  let fixture: ComponentFixture<AccountsContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
