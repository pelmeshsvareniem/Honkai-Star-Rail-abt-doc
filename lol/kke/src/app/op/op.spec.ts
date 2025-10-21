import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Op } from './op';

describe('Op', () => {
  let component: Op;
  let fixture: ComponentFixture<Op>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Op]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Op);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
