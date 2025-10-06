import { Component, Input } from '@angular/core';
import { SimulationLogEntry } from '../../model';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { PlayoffSimulatorService } from '../../playoff-simulator.service';

@Component({
  selector: 'app-simulation-log',
  templateUrl: './simulation-log.component.html',
  styleUrls: ['./simulation-log.component.scss'],
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatButtonModule, NgIf, NgFor]
})
export class SimulationLogComponent {
  @Input() log: SimulationLogEntry[] = [];
  expanded = false;

constructor(private simulator:PlayoffSimulatorService) {}

  toggleLog(): void {
    this.expanded = !this.expanded;

    this.log = this.simulator.getSimulationLog();
  }
}