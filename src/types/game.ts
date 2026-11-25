
export type PlayerRole =
  | 'batter'
  | 'bowler'
  | 'all-rounder'
  | 'wicket-keeper';

export type BowlingStyle =
  | 'right-arm-fast'
  | 'left-arm-fast'
  | 'right-arm-medium'
  | 'left-arm-medium'
  | 'off-spin'
  | 'leg-spin'
  | 'left-arm-orthodox'
  | 'left-arm-chinaman';

export type BattingStyle = 'right-handed' | 'left-handed';

export type Player = {
  id: string;
  name: string;
  age: number;
  nationality: string;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle?: BowlingStyle;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  overallRating: number;
  basePrice: number;
  auctionPrice?: number;
  teamId?: string;
  isOverseas: boolean;
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
};

export type Franchise = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  budget: number;
  remainingBudget: number;
  squad: Player[];
  captainId?: string;
  homeGround: string;
};

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'innings-break'
  | 'completed'
  | 'abandoned';

export type Innings = {
  battingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
  target?: number;
};

export type Match = {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  scheduledAt: string;
  status: MatchStatus;
  currentInnings: 1 | 2;
  innings: Innings[];
  winnerTeamId?: string;
  resultDescription?: string;
};

export type TournamentStage =
  | 'league'
  | 'qualifier-1'
  | 'eliminator'
  | 'qualifier-2'
  | 'final';

export type Tournament = {
  id: string;
  name: string;
  season: number;
  teamIds: string[];
  matches: Match[];
  currentStage: TournamentStage;
  championTeamId?: string;
};

export type AuctionStatus =
  | 'upcoming'
  | 'live'
  | 'completed';

export type AuctionLot = {
  id: string;
  playerId: string;
  currentBid: number;
  highestBidderTeamId?: string;
  status: 'available' | 'sold' | 'unsold';
};

export type Auction = {
  id: string;
  tournamentId: string;
  status: AuctionStatus;
  pursePerTeam: number;
  lots: AuctionLot[];
};
