import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeIns } from './home-ins';

describe('HomeIns', () => {
  let component: HomeIns;
  let fixture: ComponentFixture<HomeIns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeIns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeIns);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
