import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Family } from './family';

describe('Family', () => {
  let component: Family;
  let fixture: ComponentFixture<Family>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Family]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Family);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
