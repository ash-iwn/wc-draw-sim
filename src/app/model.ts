export interface Team {
  name: string;
  confederation: string;
  points: number;
  qualified?: boolean;
  host?: boolean;
  flag: string;
  placeholder?: boolean;
  description?: string;
  playoffWinner?: boolean;
  playoffPath?: string;
  projected?: boolean;
  qGroup?: string;
  playoffSlot?: string;
  nl?: boolean;
}

export interface Confederation {
  name: string;
  fullName: string;
  color: string;
  maxPerGroup: number;
  logo?: string;
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

export interface PlayoffMatchResult {
  result: string;
  matchup: string;
  probability?: number
}

// Consistent playoff path for both UEFA and Intercontinental brackets
export interface PlayoffPath {
  pathName: string;
  semiFinals: PlayoffMatchResult[]; // Always an array for consistency
  final: PlayoffMatchResult;
  winner: Team;
  seededTeam?: Team;
}

// Main playoff results structure
export interface PlayoffResults {
  uefa: PlayoffPath[];
  intercontinental: IntercontinentalPlayoffResults;
  allWinners: Team[];
}

// Intercontinental playoff results structure
export interface IntercontinentalPlayoffResults {
  participants: Team[];
  bracket1: PlayoffPath; // Uses PlayoffPath for consistency
  bracket2: PlayoffPath;
}

// For simulation log
export interface SimulationLogEntry {
  message: string;
  type: 'normal' | 'pot-start' | 'validation' | 'success' | 'error' | 'constraint' | 'team-drawn';
  timestamp: string;
}

// For legacy or alternate playoff path result
export interface PlayoffPathResult {
  path: string;
  teams: string[];
  pots: {
    pot1: string;
    pot2: string;
    pot3: string;
    pot4: string;
  };
  semiFinals: PlayoffMatchResult[];
  final: PlayoffMatchResult;
  winner: Team;
}

