import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicModelComponent } from './dynamic-model.component';

describe('DynamicModelComponent', () => {
  let component: DynamicModelComponent;
  let fixture: ComponentFixture<DynamicModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
