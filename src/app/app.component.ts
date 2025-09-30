import { Component, OnInit } from '@angular/core';
import { SimulatorService } from './sim-service';
import { Team, PlayoffResults, SimulationLogEntry, Match } from './model';
import { PlayoffsComponent } from './components/playoffs/playoffs.component';
import { PotsComponent } from './components/pots/pots.component';
import { GroupsComponent } from './components/groups/groups.component';
import { SimulationLogComponent } from './components/simulation-log/simulation-log.component';
import { MatchesComponent } from './components/matches/matches.component';
import { CommonModule } from '@angular/common';
import { WikipediaService } from './http-service';
import { DataService } from './data-service';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	providers: [SimulatorService, WikipediaService],
	imports: [
		CommonModule,
		PlayoffsComponent,
		PotsComponent,
		GroupsComponent,
		SimulationLogComponent,
		MatchesComponent]
})
export class AppComponent implements OnInit {
	pots: { [key: number]: Team[] } = {};
	groups: { [key: string]: Team[] } = {};
	matches: Match[] = [];
	playoffResults: PlayoffResults | null = null;
	simulationLog: SimulationLogEntry[] = [];
	drawInProgress = false;
	drawButtonText = '';

	constructor(private simulator: SimulatorService, private wikiService: WikipediaService, private dataService: DataService) {}

	ngOnInit(): void {
		this.pots = this.simulator.getPots();
		this.groups = this.simulator.getGroups();
		this.simulationLog = this.simulator.getSimulationLog();

		
		this.wikiService.getQualifiedTeams().subscribe(response => {
			delete response[0]; // Remove header row
			console.log(response[1]);
			const qualifiedTeams = Object.values(response).map((row: any) => row[0]) ;
			

			qualifiedTeams.forEach((teamName: string) => {
				const team = this.dataService.ALL_TEAMS_DATA.find(t => t.name === teamName);
				if(team) {
					this.dataService.QUALIFIED_TEAMS.push(team)
				};
			});
		});

		console.log('Qualified Teams:', this.dataService.QUALIFIED_TEAMS);


		console.log('Getting in contention AFC teams');

		

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