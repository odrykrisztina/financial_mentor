import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Elearning } from './elearning';

describe('Elearning', () => {
  let component: Elearning;
  let fixture: ComponentFixture<Elearning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Elearning]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Elearning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
