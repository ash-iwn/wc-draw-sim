import { Injectable } from '@angular/core';
import { Team, PlayoffResults } from './model';
import { DataService } from './data-service';


@Injectable({
  providedIn: 'root'
})
export class PlayoffSimulatorService {
  private uefaWinners: Team[] = [];
  private intercontinentalWinners: Team[] = [];
  private logger: ((message: string, type?: string) => void) | null = null;

  constructor(private dataService:DataService) { }
  setLogger(loggerFunction: (message: string, type?: string) => void): void {
    this.logger = loggerFunction;
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

  private simulateMatch(team1: Team, team2: Team) {
    const probs = this.calculateWinProbability(Number(team1.points), Number(team2.points));
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

  simulateUEFAPlayoffs(): any[] {
    this.log('UEFA Playoffs - 16 teams competing for 4 spots', 'pot-start');
    this.log('Venues: Various European cities (single-leg knockouts)', 'normal');

    const groupRunnersUp = [
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Italy'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Germany'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Austria'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Turkey'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Poland'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Czech Republic'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Scotland'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'North Macedonia'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Albania'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Armenia'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Iceland'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Kosovo')
    ];

    const nationsLeagueTeams = [
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Hungary'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Wales'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Romania'),
      this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === 'Slovenia')
    ];

    const pot1 = groupRunnersUp.slice(0, 4);
    const pot2 = groupRunnersUp.slice(4, 8);
    const pot3 = groupRunnersUp.slice(8, 12);
    const pot4 = nationsLeagueTeams;

    const playoffPaths: any = {
      'A': {
        pot1Team: pot1[0],
        pot2Team: pot2[0],
        pot3Team: pot3[0],
        pot4Team: pot4[0],
        semis: [
          { home: pot1[0], away: pot4[0] },
          { home: pot2[0], away: pot3[0] }
        ]
      },
      'B': {
        pot1Team: pot1[1],
        pot2Team: pot2[1],
        pot3Team: pot3[1],
        pot4Team: pot4[1],
        semis: [
          { home: pot1[1], away: pot4[1] },
          { home: pot2[1], away: pot3[1] }
        ]
      },
      'C': {
        pot1Team: pot1[2],
        pot2Team: pot2[2],
        pot3Team: pot3[2],
        pot4Team: pot4[2],
        semis: [
          { home: pot1[2], away: pot4[2] },
          { home: pot2[2], away: pot3[2] }
        ]
      },
      'D': {
        pot1Team: pot1[3],
        pot2Team: pot2[3],
        pot3Team: pot3[3],
        pot4Team: pot4[3],
        semis: [
          { home: pot1[3], away: pot4[3] },
          { home: pot2[3], away: pot3[3] }
        ]
      }
    };

    const results: any[] = [];

    Object.entries(playoffPaths).forEach(([pathLetter, pathData]: any) => {
      const teams = [pathData.pot1Team, pathData.pot2Team, pathData.pot3Team, pathData.pot4Team];
      this.log(`UEFA Path ${pathLetter}: ${teams.map(t => t.name).join(', ')}`, 'pot-start');
      this.log(
        `Pot 1: ${pathData.pot1Team.name} | Pot 2: ${pathData.pot2Team.name} | Pot 3: ${pathData.pot3Team.name} | Pot 4: ${pathData.pot4Team.name}`,
        'normal'
      );

      const semi1 = this.simulateMatch(pathData.semis[0].home, pathData.semis[0].away);
      const semi2 = this.simulateMatch(pathData.semis[1].home, pathData.semis[1].away);

      this.log(`March 26: SF1 (Pot 1 vs Pot 4): ${semi1.result}`, 'team-drawn');
      this.log(`March 26: SF2 (Pot 2 vs Pot 3): ${semi2.result}`, 'team-drawn');

      const final = this.simulateMatch(semi1.winner, semi2.winner);
      this.log(`March 31: Final: ${final.result}`, 'success');

      const pathWinner: Team = {
        ...final.winner,
        playoffWinner: true,
        playoffPath: `UEFA Path ${pathLetter}`
      };

      this.uefaWinners.push(pathWinner);
      this.log(`${pathWinner.name} qualifies for World Cup!`, 'success');

      results.push({
        path: pathLetter,
        teams: teams.map(t => t.name),
        pots: {
          pot1: pathData.pot1Team.name,
          pot2: pathData.pot2Team.name,
          pot3: pathData.pot3Team.name,
          pot4: pathData.pot4Team.name
        },
        semiFinals: [semi1, semi2],
        final: final,
        winner: pathWinner
      });
    });

    this.log(`UEFA Playoff Winners: ${this.uefaWinners.map(w => w.name).join(', ')}`, 'validation');
    return results;
  }

  simulateIntercontinentalPlayoffs(): any {
    this.log('FIFA Play-Off Tournament - 6 teams competing for 2 spots', 'pot-start');
    this.log('Venues: Estadio BBVA (Monterrey) & Estadio Akron (Guadalajara), Mexico', 'normal');
    this.log('Dates: March 23-31, 2026', 'normal');

    const playoffTeams = [...this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS];
    this.log(`Participants: ${playoffTeams.map(t => `${t.name} (${t.confederation})`).join(', ')}`, 'normal');

    const sortedTeams = [...playoffTeams].sort((a, b) => b.points - a.points);

    this.log('FIFA Ranking Seeding:', 'pot-start');
    sortedTeams.forEach((team, index) => {
      this.log(`   ${index + 1}. ${team.name} (${team.points} pts)`, 'normal');
    });

    const seededTeams = sortedTeams.slice(0, 2);
    const unseededTeams = sortedTeams.slice(2, 6);

    const bracket1Seed = seededTeams[0];
    const bracket2Seed = seededTeams[1];
    const bracket1Semi = [unseededTeams[0], unseededTeams[3]];
    const bracket2Semi = [unseededTeams[1], unseededTeams[2]];

    this.log('Bracket 1 (Estadio BBVA, Monterrey):', 'pot-start');
    this.log(`   Seeded: ${bracket1Seed.name} (${bracket1Seed.points} pts)`, 'normal');
    this.log(`   Semi-final: ${bracket1Semi[0].name} vs ${bracket1Semi[1].name}`, 'normal');

    const bracket1SemiResult = this.simulateMatch(bracket1Semi[0], bracket1Semi[1]);
    this.log(`   Semi-final: ${bracket1SemiResult.result}`, 'team-drawn');

    const bracket1FinalResult = this.simulateMatch(bracket1Seed, bracket1SemiResult.winner);
    this.log(`   Final: ${bracket1FinalResult.result}`, 'success');

    this.log('Bracket 2 (Estadio Akron, Guadalajara):', 'pot-start');
    this.log(`   Seeded: ${bracket2Seed.name} (${bracket2Seed.points} pts)`, 'normal');
    this.log(`   Semi-final: ${bracket2Semi[0].name} vs ${bracket2Semi[1].name}`, 'normal');

    const bracket2SemiResult = this.simulateMatch(bracket2Semi[0], bracket2Semi[1]);
    this.log(`   Semi-final: ${bracket2SemiResult.result}`, 'team-drawn');

    const bracket2FinalResult = this.simulateMatch(bracket2Seed, bracket2SemiResult.winner);
    this.log(`   Final: ${bracket2FinalResult.result}`, 'success');

    const winner1: Team = {
      ...bracket1FinalResult.winner,
      playoffWinner: true,
      
    };

    const winner2: Team = {
      ...bracket2FinalResult.winner,
      playoffWinner: true,
     
    };

    this.intercontinentalWinners = [winner1, winner2];

    this.log(`${winner1.name} qualifies for World Cup! (Bracket 1 Winner)`, 'success');
    this.log(`${winner2.name} qualifies for World Cup! (Bracket 2 Winner)`, 'success');
    this.log(`FIFA Play-Off Winners: ${winner1.name}, ${winner2.name}`, 'validation');

    return {
      participants: playoffTeams,
      seeding: sortedTeams.map((team, index) => ({ rank: index + 1, team: team.name, points: team.points })),
      bracket1: {
        seed: bracket1Seed.name,
        semifinal: bracket1SemiResult,
        final: bracket1FinalResult,
        winner: winner1
      },
      bracket2: {
        seed: bracket2Seed.name,
        semifinal: bracket2SemiResult,
        final: bracket2FinalResult,
        winner: winner2
      },
      winners: [winner1, winner2]
    };
  }

  simulateAllPlayoffs(): PlayoffResults {
    this.uefaWinners = [];
    this.intercontinentalWinners = [];

    this.log('Starting FIFA World Cup 2026 Playoff Phase', 'validation');
    this.log('', 'normal');

    const uefaResults = this.simulateUEFAPlayoffs();

    this.log('', 'normal');
    this.log('---------------------------------------------------', 'normal');
    this.log('', 'normal');

    const intercontinentalResults = this.simulateIntercontinentalPlayoffs();

    const allPlayoffWinners = [
      ...this.uefaWinners,
      ...this.intercontinentalWinners
    ];

    this.log('', 'normal');
    this.log('All 6 Playoff Spots Determined:', 'validation');
    this.log('', 'normal');
    this.log('UEFA Playoff Winners:', 'pot-start');
    this.uefaWinners.forEach((winner, index) => {
      this.log(`   ${index + 1}. ${winner.name} (${winner.points} pts) - ${winner.playoffPath}`, 'success');
    });

    this.log('FIFA Play-Off Winners:', 'pot-start');
    this.intercontinentalWinners.forEach((winner, index) => {
      this.log(`   ${index + 1}. ${winner.name} (${winner.confederation}) - ${winner.points} pts`, 'success');
    });

    this.log('', 'normal');
    this.log('Playoff phase complete - 48 teams now qualified for World Cup 2026!', 'validation');

    return {
      uefa: uefaResults,
      intercontinental: intercontinentalResults,
      allWinners: allPlayoffWinners
    };
  }

  getFinalQualifiedTeams(): Team[] {
    return [
      ...this.dataService.QUALIFIED_TEAMS,
      ...this.uefaWinners,
      ...this.intercontinentalWinners
    ];
  }
}