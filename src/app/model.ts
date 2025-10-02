export interface Team {
  name: string;
  confederation: string;
  points: number | string;
  qualified?: boolean;
  host?: boolean;
  flag: string;
  placeholder?: boolean;
  description?: string;
  playoffWinner?: boolean;
  playoffPath?: string;
  projected?: boolean;
  qGroup?: string;
}

export interface Confederation {
  name: string;
  fullName: string;
  color: string;
  maxPerGroup: number;
  logo?: string; // Optional, since you may drop emojis
}

export interface Pot {
  potNumber: number;
  teams: Team[];
}

export interface Group {
  letter: string;
  teams: Team[];
}

export interface Match {
  match: number;
  group: string;
  team1: string;
  team2: string;
  venue: string;
  venueInfo?: Venue;
  date?: string;
  time?: string;
  stage?: string;
}

export interface Venue {
  name: string;
  city: string;
  country: string;
  capacity?: number;
}

export interface PlayoffPath {
  pathName: string;
  semifinal: PlayoffMatchResult;
  final: PlayoffMatchResult;
  winner: Team;
}

export interface PlayoffMatchResult {
  matchup: string;
  result: string;
  probability: number;
}

export interface PlayoffResults {
  uefa: PlayoffPath[];
  intercontinental: {
    participants: Team[];
    bracket1: PlayoffPath;
    bracket2: PlayoffPath;
  };
  allWinners: Team[];
}

export interface SimulationLogEntry {
  message: string;
  type: 'normal' | 'pot-start' | 'validation' | 'success' | 'error' | 'constraint' | 'team-drawn';
  timestamp: string;
}