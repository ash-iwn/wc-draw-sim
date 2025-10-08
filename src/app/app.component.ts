import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SimulatorService } from './sim-service';
import { Team, PlayoffResults, SimulationLogEntry, Match } from './model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WikipediaService } from './services/http-service';
import { DataService } from './services/data-service';
import { QualifiersComponent } from './components/qualifiers/qualifiers.component'; // adjust path if needed
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PlayoffsComponent } from './components/playoffs/playoffs.component';
import { PotsComponent } from './components/pots/pots.component';
import { GroupsComponent } from './components/groups/groups.component';
import { SimulationLogComponent } from './components/simulation-log/simulation-log.component';
import { MatchesComponent } from "./components/matches/matches.component";
import {MatTabsModule} from '@angular/material/tabs';

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
	MatTabsModule,
    CommonModule,
    QualifiersComponent,
    PlayoffsComponent,
    PotsComponent,
    MatchesComponent,
	GroupsComponent
]
})
export class AppComponent implements OnInit {
	@ViewChild(QualifiersComponent) qualifiersComp!: QualifiersComponent;
	@ViewChild('potsTabContent') potsTabContent!: ElementRef;
	@ViewChild('simulationTabs') mainTabs!: ElementRef;

	showTabs = false;
	groups: { [key: string]: Team[] } = {};
	matches: Match[] = [];
	playoffResults: PlayoffResults | null = null;
	simulationLog: SimulationLogEntry[] = [];
	drawInProgress = false;
	drawButtonText = '';
	qualifiersReady = false; 
	

	constructor(
		public simulator: SimulatorService,
		private wikiService: WikipediaService,
		public dataService: DataService,
	 	private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		

		this.dataService.loadTeamsData();
		this.wikiService.getQualifiedTeams().subscribe({
			next: response => {
				Promise.resolve().then(() => {
				// process response and update dataService
				delete response[0];
				const qTeams = Object.values(response).map((row: any) => row[0]);
				qTeams.forEach((teamName: string) => {
					const team = this.dataService.ALL_TEAMS_DATA.find(t => t.name === teamName);
					// Only push valid teams, never undefined
					if (team) {
					this.dataService.QUALIFIED_TEAMS.push(team);
					team.qualified = true;
					}
				});

				// Remove any accidental undefined entries (extra guard)
				this.dataService.QUALIFIED_TEAMS = this.dataService.QUALIFIED_TEAMS.filter(t => !!t);

				this.qualifiersReady = true;
				console.log('Qualified Teams pulled from Wiki API', this.dataService.QUALIFIED_TEAMS);
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
		this.showTabs = false;
		this.drawButtonText = 'Simulating Playoffs...';
		this.drawInProgress = true;
		setTimeout(()=> {
			
			this.playoffResults = this.simulator.simulatePlayoffs();
			this.simulator.simulateDraw();
			this.simulator.generateMatches();

			this.drawInProgress = false;
			this.showTabs = true;
			setTimeout(() => {
				if (this.mainTabs) {
					//this.mainTabs.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
				
			}, 0);
		}, 500);


		

		
		

		// setTimeout(() => {
		// 	this.playoffResults = this.simulator.simulatePlayoffs();
		// 	this.pots = this.simulator.getPots();
		// 	this.simulationLog = this.simulator.getSimulationLog();
		// 	this.drawButtonText = 'Drawing Groups...';

		// 	setTimeout(() => {
		// 		this.groups = this.simulator.simulateDraw();
		// 		this.matches = this.simulator.generateMatches();
		// 		this.simulationLog = this.simulator.getSimulationLog();
		// 		this.drawInProgress = false;
		// 		this.drawButtonText = '';
		// 	}, 2000);
		// }, 3000);
	}


	getQualifiedTeamsForConf(conf:string) {
		return this.dataService.QUALIFIED_TEAMS.filter(t => t.confederation === conf);
	}

	getProjectedTeamsForConf(conf:string) {
		return this.dataService.PROJECTED_QUALIFIERS.filter(t => t.confederation === conf);
	}
}