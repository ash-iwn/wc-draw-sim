import { Injectable } from '@angular/core';
import {
    Team,
    PlayoffResults,
    PlayoffMatchResult,
    PlayoffPath,
    IntercontinentalPlayoffResults,
    SimulationLogEntry
} from './model';
import { DataService } from './services/data-service';

@Injectable({
  providedIn: 'root'
})
export class PlayoffSimulatorService {
  private uefaWinners: Team[] = [];
  private intercontinentalWinners: Team[] = [];
  private logger: ((message: string, type?: string) => void) | null = null;
  pots: { [key: number]: any[] } = {};

  private simulationLog: SimulationLogEntry[] = [];

  constructor(private dataService:DataService) {}
  setLogger(loggerFunction: (message: string, type?: string) => void): void {
    this.logger = loggerFunction;
  }

  logEntry(
    message: string,
    type: 'normal' | 'pot-start' | 'validation' | 'success' | 'error' | 'constraint' | 'team-drawn' = 'normal'
  ): void {
    this.simulationLog.push({
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  getSimulationLog(): SimulationLogEntry[] {
    return this.simulationLog;
  }

  private log(message: string, type: string = 'normal'): void {
    if (this.logger) {
      this.logger(message, type);
    }
  }


  private calculateWinProbability(team1Points: number, team2Points: number): { team1: number; team2: number } {
    const pointsDiff = team1Points - team2Points;
    let team1Prob = 0.5;
    const maxAdjustment = 0.4;
    const scaleFactor = 0.002;
    const adjustment = Math.tanh(pointsDiff * scaleFactor) * maxAdjustment;
    team1Prob += adjustment;
    team1Prob = Math.max(0.1, Math.min(0.9, team1Prob));
    return {
      team1: team1Prob,
      team2: 1 - team1Prob
    };
  }

  private simulateMatch(team1: Team, team2: Team): PlayoffMatchResult & { winner: Team; loser: Team } {
    const probs = this.calculateWinProbability(team1.points, team2.points);
    const winner = team1.points >= team2.points ? team1 : team2;
    const loser = winner === team1 ? team2 : team1;
    const winnerProb = winner === team1 ? probs.team1 : probs.team2;
    return {
      winner,
      loser,
      probability: winnerProb,
      matchup: `${team1.name} vs ${team2.name}`,
      result: `${winner.name} wins (${Math.round(winnerProb * 100)}% probability)`
    };
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  simulateUEFAPlayoffs(): PlayoffPath[] {
    // 1. Sort the 12 teams with nl=false by points descending
    const runnerUpTeams = this.dataService.UEFA_PLAYOFF_TEAMS
      .filter(t => !t.nl)
      .sort((a, b) => b.points - a.points);

    // 2. Add the 4 teams with nl=true to the end
    const nlTeams = this.dataService.UEFA_PLAYOFF_TEAMS.filter(t => t.nl);
    let sortedTeams = [...runnerUpTeams, ...nlTeams];


    // 3. Split into 4 quartiles
    let quartiles = [
      sortedTeams.slice(0, 4),
      sortedTeams.slice(4, 8),
      sortedTeams.slice(8, 12),
      sortedTeams.slice(12, 16)
    ];

    const paths: PlayoffPath[] = [];
    for (let i = 0; i < 4; i++) {
      // Pick a random team from each quartile and remove it from the quartile
      const potTeams = quartiles.map(q => {
        const idx = Math.floor(Math.random() * q.length);
        return q.splice(idx, 1)[0];
      });

      const semi1 = this.simulateMatch(potTeams[0], potTeams[3]);
      const semi2 = this.simulateMatch(potTeams[1], potTeams[2]);
      const final = this.simulateMatch(semi1.winner, semi2.winner);
      const winner: Team = { ...final.winner, playoffWinner: true, playoffPath: `UEFA Path ${String.fromCharCode(65 + i)}` };
      this.uefaWinners.push(winner);
      paths.push({
        pathName: `Path ${String.fromCharCode(65 + i)}`,
        semiFinals: [semi1, semi2],
        final,
        winner
      });
    }

    return paths;
  }

  simulateIntercontinentalPlayoffs(): IntercontinentalPlayoffResults  {
    const playoffTeams = [...this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS];
    const sortedTeams = [...playoffTeams].sort((a, b) => b.points - a.points);
    const seededTeams = sortedTeams.slice(0, 2);
    const unseededTeams = sortedTeams.slice(2, 6);

    const bracket1Seed = seededTeams[0];
    const bracket2Seed = seededTeams[1];
    const bracket1Semi = [unseededTeams[0], unseededTeams[3]];
    const bracket2Semi = [unseededTeams[1], unseededTeams[2]];

    const bracket1SemiResult = this.simulateMatch(bracket1Semi[0], bracket1Semi[1]);
    const bracket1FinalResult = this.simulateMatch(bracket1Seed, bracket1SemiResult.winner);

    const bracket2SemiResult = this.simulateMatch(bracket2Semi[0], bracket2Semi[1]);
    const bracket2FinalResult = this.simulateMatch(bracket2Seed, bracket2SemiResult.winner);

    const winner1: Team = { ...bracket1FinalResult.winner, playoffWinner: true, playoffPath: 'Inter-confederation' };
    const winner2: Team = { ...bracket2FinalResult.winner, playoffWinner: true, playoffPath: 'Inter-confederation' };

    this.intercontinentalWinners = [winner1, winner2];

    return {
      participants: playoffTeams,
      bracket1: {
        pathName: bracket1Seed.name,
        semiFinals: [bracket1SemiResult],
        final: bracket1FinalResult,
        winner: winner1
      },
      bracket2: {
        pathName: bracket2Seed.name,
        semiFinals: [bracket2SemiResult],
        final: bracket2FinalResult,
        winner: winner2
      }
    };
  }

  simulateAllPlayoffs(): PlayoffResults {
    this.uefaWinners = [];
    this.intercontinentalWinners = [];
    const uefaResults = this.simulateUEFAPlayoffs();
    const intercontinentalResults = this.simulateIntercontinentalPlayoffs();
    const allPlayoffWinners = [...this.uefaWinners, ...this.intercontinentalWinners];
    return {
      uefa: uefaResults,
      intercontinental: intercontinentalResults,
      allWinners: allPlayoffWinners
    };
  }

  getFinalQualifiedTeams(): Team[] {
    let res = [
      ...this.dataService.QUALIFIED_TEAMS,
      ...this.dataService.PROJECTED_QUALIFIERS,
      ...this.uefaWinners,
      ...this.intercontinentalWinners
    ];

    return res;
  }
}