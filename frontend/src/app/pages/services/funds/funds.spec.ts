import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Funds } from './funds';

describe('Funds', () => {
  let component: Funds;
  let fixture: ComponentFixture<Funds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Funds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Funds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
