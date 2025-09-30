import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationLogComponent } from './simulation-log.component';

describe('SimulationLogComponent', () => {
  let component: SimulationLogComponent;
  let fixture: ComponentFixture<SimulationLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
