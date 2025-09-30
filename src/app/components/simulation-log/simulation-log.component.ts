import { Component, Input } from '@angular/core';
import { SimulationLogEntry } from '../../model';

@Component({
  selector: 'app-simulation-log',
  standalone: true,
  imports: [],
  templateUrl: './simulation-log.component.html',
  styleUrl: './simulation-log.component.scss'
})
export class SimulationLogComponent {
@Input() log: SimulationLogEntry[] = [];
}
