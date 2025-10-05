import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SimulatorService } from './sim-service';
import { Team, PlayoffResults, SimulationLogEntry, Match } from './model';
import { PlayoffsComponent } from './components/playoffs/playoffs.component';
import { PotsComponent } from './components/pots/pots.component';
import { GroupsComponent } from './components/groups/groups.component';
import { SimulationLogComponent } from './components/simulation-log/simulation-log.component';
import { FormBuilder, FormGroup, ValidatorFn, AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatchesComponent } from './components/matches/matches.component';
import { CommonModule } from '@angular/common';
import { WikipediaService } from './http-service';
import { DataService } from './data-service';
import { QualifiersComponent } from './components/qualifiers/qualifiers.component'; // adjust path if needed
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	providers: [SimulatorService, WikipediaService],
	imports: [
	ReactiveFormsModule,
	CommonModule,
	MatButtonModule,
	MatFormFieldModule,
	MatSelectModule,
	MatOptionModule,
	MatButtonModule,
	MatFormFieldModule,
	MatSelectModule,
	MatOptionModule,
	MatExpansionModule,
    CommonModule,
    PlayoffsComponent,
    PotsComponent,
    GroupsComponent,
    SimulationLogComponent,
    MatchesComponent,
    QualifiersComponent, 
]
})
export class AppComponent implements OnInit {
	@ViewChild(QualifiersComponent) qualifiersComp!: QualifiersComponent;

	pots: { [key: number]: Team[] } = {};
	groups: { [key: string]: Team[] } = {};
	matches: Match[] = [];
	playoffResults: PlayoffResults | null = null;
	simulationLog: SimulationLogEntry[] = [];
	drawInProgress = false;
	drawButtonText = '';
	qualifiersReady = false; 
	

	constructor(
		private simulator: SimulatorService,
		private wikiService: WikipediaService,
		public dataService: DataService,
	 	private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.pots = this.simulator.getPots();
		this.groups = this.simulator.getGroups();
		this.simulationLog = this.simulator.getSimulationLog();
		
		
		this.wikiService.getQualifiedTeams().subscribe({
      next: response => {
        Promise.resolve().then(() => {
          // process response and update dataService
          delete response[0];
          const qTeams = Object.values(response).map((row: any) => row[0]);
          qTeams.forEach((teamName: string) => {
            const team = this.dataService.ALL_TEAMS_DATA.find(t => t.name === teamName);
            if (team) {
              this.dataService.QUALIFIED_TEAMS.push(team);
              team.qualified = true;
            }
          });

          this.qualifiersReady = true;
		  console.log('WIKI SERVICE FINISHED', this.dataService.QUALIFIED_TEAMS);
          // optional: immediately run change detection
		   if (this.qualifiersComp && typeof this.qualifiersComp.applyCafLocks === 'function') {
            this.qualifiersComp.applyCafLocks();
            
	        }

			this.cdr.detectChanges();
  
        });
      },
      error: err => {
        console.error('Failed to load wiki qualifiers', err);
        //Promise.resolve().then(() => this.qualifiersReady = true);
      }
    });

		



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