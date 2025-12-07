import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pension } from './pension';

describe('Pension', () => {
  let component: Pension;
  let fixture: ComponentFixture<Pension>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pension]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pension);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
