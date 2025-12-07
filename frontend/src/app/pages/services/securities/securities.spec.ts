import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Securities } from './securities';

describe('Securities', () => {
  let component: Securities;
  let fixture: ComponentFixture<Securities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Securities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Securities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
