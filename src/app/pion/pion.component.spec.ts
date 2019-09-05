import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PionComponent } from './pion.component';

describe('PionComponent', () => {
  let component: PionComponent;
  let fixture: ComponentFixture<PionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
