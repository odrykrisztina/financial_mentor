import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Colleagues } from './colleagues';

describe('Colleagues', () => {
  let component: Colleagues;
  let fixture: ComponentFixture<Colleagues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Colleagues]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Colleagues);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
