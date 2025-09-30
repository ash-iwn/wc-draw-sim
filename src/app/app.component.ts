import { Component, OnInit } from '@angular/core';
import { SimulatorService } from './sim-service';
import { Team, PlayoffResults, SimulationLogEntry, Match } from './model';
import { PlayoffsComponent } from './components/playoffs/playoffs.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SimulatorService],
})
export class AppComponent implements OnInit {
  pots: { [key: number]: Team[] } = {};
  groups: { [key: string]: Team[] } = {};
  matches: Match[] = [];
  playoffResults: PlayoffResults | null = null;
  simulationLog: SimulationLogEntry[] = [];
  drawInProgress = false;
  drawButtonText = '';

  constructor(private simulator: SimulatorService) {}

  ngOnInit(): void {
    this.pots = this.simulator.getPots();
    this.groups = this.simulator.getGroups();
    this.simulationLog = this.simulator.getSimulationLog();
  }

  performCompleteDraw(): void {
    this.drawInProgress = true;
    this.drawButtonText = 'Simulating Playoffs...';

    setTimeout(() => {
      this.playoffResults = this.simulator.simulatePlayoffs();
      this.pots = this.simulator.getPots();
      this.simulationLog = this.simulator.getSimulationLog();
      this.drawButtonText = 'Drawing Groups...';

      setTimeout(() => {
        this.groups = this.simulator.simulateDraw();
        this.matches = this.simulator.generateMatches();
        this.simulationLog = this.simulator.getSimulationLog();
        this.drawInProgress = false;
        this.drawButtonText = '';
      }, 2000);
    }, 3000);
  }
}