import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mortgage } from './mortgage';

describe('Mortgage', () => {
  let component: Mortgage;
  let fixture: ComponentFixture<Mortgage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mortgage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mortgage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
