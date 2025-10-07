import { Injectable } from '@angular/core';
import { Team, PlayoffResults, SimulationLogEntry, Venue, Match} from './model';

import { PlayoffSimulatorService } from './playoff-simulator.service';
import { DataService } from './data-service';



@Injectable({
  providedIn: 'root'
})
export class SimulatorService {
  groups: { [key: string]: Team[] } = {};
  pots: { [key: number]: Team[] } = { 1: [], 2: [], 3: [], 4: [] };
  allTeams: Team[] = [];
  playoffResults: PlayoffResults | null = null;
  simulationLog: SimulationLogEntry[] = [];
  matches:any[] = [];

  constructor(private playoffSimulator: PlayoffSimulatorService, private dataService: DataService) {
    this.initializeTeams();
  }

  initializeTeams(): void {
    // Create teams from qualified and projected teams (initially with placeholders)
    this.allTeams = this.createFullTeamsList();
    this.createPots();
  }

  public setPots(p: { [key: number]: any[] } ) {
    this.pots = p;
  }

  public hasPots(): boolean {
    if (!this.pots || Object.keys(this.pots).length === 0) return false;
    // Check if all pots are empty arrays
    return Object.values(this.pots).some(potArr => Array.isArray(potArr) && potArr.length > 0);
  }

  createFullTeamsList(): Team[] {
    // If playoffs haven't been simulated yet, use placeholders
    if (!this.playoffResults) {
      const allTeams = [
        ...this.dataService.QUALIFIED_TEAMS,
        ...this.dataService.PROJECTED_QUALIFIERS,
        ...this.dataService.PLAYOFF_TEAMS
      ].map(team => ({
        ...team,
        points: typeof team.points === 'string' ? Number(team.points) : team.points
      }));

      return allTeams.slice(0, 48);
    }

    // Use actual playoff winners - NO placeholders
    const allTeams = [
      ...this.dataService.QUALIFIED_TEAMS,
      ...this.dataService.PROJECTED_QUALIFIERS,
      ...this.playoffResults.allWinners
    ];

    // Ensure we have exactly 48 teams
    return allTeams.slice(0, 48);
  }

  simulatePlayoffs(): PlayoffResults {
    this.simulationLog = [];
    this.logEntry('Starting March 2026 Playoff Simulations', 'pot-start');

    // Pass logging function to playoff simulator
    this.playoffSimulator.setLogger((message: string, type?: string) => 
      this.logEntry(message, (type ?? "normal") as SimulationLogEntry["type"])
    );
    this.playoffResults = this.playoffSimulator.simulateAllPlayoffs();

    // Recreate teams list with actual playoff winners
    this.logEntry('Updating team list with playoff winners...', 'validation');
    this.allTeams = this.createFullTeamsList();
    this.logEntry(`Final team count: ${this.allTeams.length} teams`, 'success');
    this.logEntry(
      `Playoff winners added: ${this.allTeams.filter(t => t.playoffWinner).map(t => t.name).join(', ')}`,
      'success'
    );

    this.logEntry('Creating pots based on FIFA rankings...', 'validation');
    this.createPots();
    this.testEdgeCases();

    return this.playoffResults;
  }

  testEdgeCases(): void {
    // Edge Case 1: UEFA Overflow - What if 10 UEFA teams are in Pot 4?
    const uefaInPot4 = this.pots[4].filter(t => t.confederation === 'UEFA').length;
    if (uefaInPot4 > 8) {
      console.warn(`Risk: Too many UEFA teams in Pot 4 could cause placement issues`);
    }

    // Edge Case 2: CAF Clustering - Are all CAF teams in one pot?
    const cafDistribution = [1, 2, 3, 4].map(pot =>
      this.pots[pot].filter(t => t.confederation === 'CAF').length
    );
    const maxCafInOnePot = Math.max(...cafDistribution);
    if (maxCafInOnePot > 6) {
      console.warn(`Risk: ${maxCafInOnePot} CAF teams in one pot could cause issues`);
    }

    // Edge Case 3: Host Ripple Effect - How many CONCACAF teams per pot?
    // (No warning, just for info)

    // Edge Case 4: Single Team Confederations - OFC isolation
    const ofcTeams = this.allTeams.filter(t => t.confederation === 'OFC');
    if (ofcTeams.length === 1) {
      const ofcPot = [1, 2, 3, 4].find(pot => this.pots[pot].some(t => t.confederation === 'OFC'));
      // Single OFC team in Pot X
    }

    // Edge Case 5: Mathematical Constraints - Total teams by confederation
    const confederationTotals: { [conf: string]: number } = {};
    this.allTeams.forEach(team => {
      confederationTotals[team.confederation] = (confederationTotals[team.confederation] || 0) + 1;
    });
    Object.keys(confederationTotals).forEach(conf => {
      const count = confederationTotals[conf];
      const maxSlots = conf === 'UEFA' ? 24 : 12; // UEFA can have 2 per group, others 1
      if (count > maxSlots) {
        console.error(`IMPOSSIBLE: ${conf} has ${count} teams but only ${maxSlots} slots available!`);
      }
    });
  }

  createPots(): void {
    // Separate playoff winners from other teams - playoff winners ALWAYS go to Pot 4
    const playoffWinners = this.allTeams.filter(team => team.playoffWinner && !team.placeholder);
    const qualifiedTeams = this.allTeams
      .filter(team => !team.placeholder && !team.playoffWinner)
      .sort((a, b) => Number(b.points) - Number(a.points));

    // Pot 1: 3 hosts + 9 best qualified teams by ranking
    const hosts = qualifiedTeams.filter(team => team.host);
    const nonHostRanked = qualifiedTeams.filter(team => !team.host);

    // Calculate how many spots are left for qualified teams in Pot 4
    const pot4SpotsForQualified = 12 - playoffWinners.length;

    // Distribute qualified teams into pots based purely on FIFA rankings
    this.pots[1] = [...hosts, ...nonHostRanked.slice(0, 9)];
    this.pots[2] = nonHostRanked.slice(9, 21);
    this.pots[3] = nonHostRanked.slice(21, 33);
    this.pots[4] = [...playoffWinners, ...nonHostRanked.slice(33, 33 + pot4SpotsForQualified)];
  }

  simulateDraw(): { [key: string]: Team[] } {
    this.logEntry('Starting FIFA World Cup 2026 Group Stage Draw', 'pot-start');

    this.groups = {};
    // Initialize groups A-L
    for (let i = 0; i < 12; i++) {
      const groupLetter = String.fromCharCode(65 + i);
      this.groups[groupLetter] = [];
    }

    // Pre-assign hosts
    this.groups['A'].push(this.pots[1].find(team => team.name === 'Mexico')!);
    this.groups['B'].push(this.pots[1].find(team => team.name === 'Canada')!);
    this.groups['D'].push(this.pots[1].find(team => team.name === 'United States')!);

    // Draw remaining Pot 1 teams randomly
    const remainingPot1 = this.pots[1].filter(
      team => !['Mexico', 'Canada', 'United States'].includes(team.name)
    );
    const availableGroups = ['C', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    this.shuffleArray(remainingPot1);

    remainingPot1.forEach(team => {
      const eligibleGroups = availableGroups.filter(
        groupLetter => this.groups[groupLetter].length === 0
      );
      if (eligibleGroups.length === 0) return;
      this.shuffleArray(eligibleGroups);
      const selectedGroup = eligibleGroups[0];
      this.groups[selectedGroup].push(team);
      const groupIndex = availableGroups.indexOf(selectedGroup);
      if (groupIndex > -1) {
        availableGroups.splice(groupIndex, 1);
      }
    });

    // Draw Pots 2, 3, and 4
    for (let pot = 2; pot <= 4; pot++) {
      this.drawPot(pot);
    }

    // Final validation and emergency fixes
    this.validateAndFixDraw();

    return this.groups;
  }

  validateAndFixDraw(): void {
    const incompleteGroups = Object.keys(this.groups).filter(g => this.groups[g].length !== 4);

    if (incompleteGroups.length > 0) {
      incompleteGroups.forEach(g => {
        // Log error
      });

      // EMERGENCY FIX: Balance the groups
      this.emergencyBalanceGroups();

      // Re-validate
      const stillIncomplete = Object.keys(this.groups).filter(g => this.groups[g].length !== 4);
      if (stillIncomplete.length > 0) {
        // Log error
      }
    }
  }

  emergencyBalanceGroups(): void {
    // Collect all teams and redistribute
    const allTeams: Team[] = [];
    Object.keys(this.groups).forEach(groupLetter => {
      allTeams.push(...this.groups[groupLetter]);
      this.groups[groupLetter] = [];
    });

    // Redistribute teams evenly (4 per group)
    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    for (let i = 0; i < allTeams.length; i++) {
      const groupIndex = Math.floor(i / 4);
      if (groupIndex < groupLetters.length) {
        this.groups[groupLetters[groupIndex]].push(allTeams[i]);
      } else {
        const extraGroupIndex = i % groupLetters.length;
        this.groups[groupLetters[extraGroupIndex]].push(allTeams[i]);
      }
    }
  }

  drawPot(potNumber: number): void {
    const availableTeams = [...this.pots[potNumber]];
    const success = this.drawPotWithBacktracking(availableTeams, potNumber);

    if (!success) {
      this.forceCompletePot(availableTeams, potNumber);
    }
  }

  drawPotWithBacktracking(
    teams: Team[],
    potNumber: number,
    placements: { team: Team; group: string }[] = []
  ): boolean {
    if (teams.length === 0) {
      placements.forEach(placement => {
        this.groups[placement.group].push(placement.team);
      });
      return true;
    }

    const team = teams[0];
    const remainingTeams = teams.slice(1);

    const currentIncompleteGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].filter(
      groupLetter => {
        const currentSize =
          this.groups[groupLetter].length + placements.filter(p => p.group === groupLetter).length;
        return currentSize < potNumber;
      }
    );

    const eligibleGroups = currentIncompleteGroups.filter(groupLetter => {
      const tempGroup = [...this.groups[groupLetter]];
      placements.filter(p => p.group === groupLetter).forEach(p => {
        tempGroup.push(p.team);
      });
      return this.canAddTeamToGroup(team, tempGroup);
    });

    if (eligibleGroups.length === 0) {
      return false;
    }

    this.shuffleArray(eligibleGroups);

    for (const group of eligibleGroups) {
      const newPlacements = [...placements, { team, group }];
      if (this.drawPotWithBacktracking(remainingTeams, potNumber, newPlacements)) {
        return true;
      }
    }

    return false;
  }

  forceCompletePot(teams: Team[], potNumber: number): void {
    teams.forEach(team => {
      const incompleteGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].filter(
        groupLetter => this.groups[groupLetter].length < potNumber
      );
      if (incompleteGroups.length > 0) {
        this.groups[incompleteGroups[0]].push(team);
      }
    });
  }

  canAddTeamToGroup(team: Team, group: Team[]): boolean {
    if (team.placeholder) return true;
    const confederation = team.confederation;
    const sameConfederationCount = group.filter(t => t.confederation === confederation).length;
    if (confederation === 'UEFA') {
      if (sameConfederationCount >= 2) {
        return false;
      }
    } else {
      if (sameConfederationCount >= 1) {
        return false;
      }
    }
    return true;
  }

  shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  generateMatches() {
    this.matches = []
    const allMatches: any[] = [];
    (Object.keys(this.groups) as Array<keyof typeof this.groups>).forEach(groupLetter => {
      const groupTeams = this.groups[groupLetter];
      const groupMatchTemplate = this.dataService.GROUP_MATCHES[groupLetter as keyof typeof this.dataService.GROUP_MATCHES];
      if (!groupMatchTemplate || groupTeams.length !== 4) return;
      const matches = groupMatchTemplate.map((matchTemplate: { match: number; team1: string | number; team2: string | number; venue:string }) => {
        return {
          ...matchTemplate,
          group: groupLetter,
          team1: this.getTeamNameForPosition(groupLetter.toString(), String(matchTemplate.team1), groupTeams),
          team2: this.getTeamNameForPosition(groupLetter.toString(), String(matchTemplate.team2), groupTeams),
          venue: matchTemplate.venue,
          venueInfo: this.dataService.VENUES[matchTemplate.venue as keyof typeof this.dataService.VENUES]
        };
      });
      allMatches.push(...matches);
    });
    this.matches = allMatches.sort((a, b) => a.match - b.match);
  }

  getTeamNameForPosition(groupLetter: string, position: string | number, groupTeams: Team[]): string {
    if (position === 'Mexico' || position === 'Canada' || position === 'United States') {
      return String(position);
    }
    const posStr = String(position);
    const positionNumber = parseInt(posStr.slice(1));
    if (positionNumber && positionNumber <= groupTeams.length) {
      return groupTeams[positionNumber - 1].name;
    }
    const posIndex = parseInt(posStr.slice(1)) - 1;
    return groupTeams[posIndex] ? groupTeams[posIndex].name : posStr;
  }

  getPots(): { [key: number]: Team[] } {
    return this.pots;
  }

  logEntry(message: string, type: SimulationLogEntry["type"]): void {
    this.simulationLog.push({ message, type, timestamp: new Date().toLocaleTimeString() });
  }

  getSimulationLog(): SimulationLogEntry[] {
    return this.simulationLog;
  }

  getGroups(): { [key: string]: Team[] } {
    return this.groups;
  }
}