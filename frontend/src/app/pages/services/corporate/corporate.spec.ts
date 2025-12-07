import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Corporate } from './corporate';

describe('Corporate', () => {
  let component: Corporate;
  let fixture: ComponentFixture<Corporate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Corporate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Corporate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
