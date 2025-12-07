import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordFrogot } from './password-frogot';

describe('PasswordFrogot', () => {
  let component: PasswordFrogot;
  let fixture: ComponentFixture<PasswordFrogot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordFrogot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordFrogot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
