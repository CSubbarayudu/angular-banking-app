import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsContainerComponent } from './accounts-container.component';

describe('AccountsContainer', () => {
  let component: AccountsContainerComponent;
  let fixture: ComponentFixture<AccountsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
