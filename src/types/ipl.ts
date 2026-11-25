
/**
 * WORLD CRICKET ZENITH
 * Real-world IPL player data types
 *
 * This file defines the structure for season-specific
 * IPL player records. It does not modify fictional players.
 */

export type IPLPlayerRole =
  | "Batter"
  | "Wicketkeeper"
  | "All-rounder"
  | "Bowler";

export type IPLBattingStyle =
  | "Right-handed"
  | "Left-handed";

export type IPLBowlingStyle =
  | "Right-arm fast"
  | "Right-arm fast-medium"
  | "Right-arm medium"
  | "Left-arm fast"
  | "Left-arm fast-medium"
  | "Left-arm medium"
  | "Right-arm off-spin"
  | "Right-arm leg-spin"
  | "Left-arm orthodox"
  | "Left-arm wrist-spin"
  | "None";

export type IPLPlayerStatus =
  | "Active"
  | "Retired"
  | "Unavailable"
  | "Unconfirmed";

export type IPLContractStatus =
  | "Retained"
  | "Auction"
  | "Traded"
  | "Replacement"
  | "Unsold"
  | "Unconfirmed";

export interface IPLPlayerSeasonStats {
  season: number;
  matches: number;
  innings: number;
  runs: number;
  highestScore: number;
  battingAverage: number;
  strikeRate: number;
  hundreds: number;
  fifties: number;
  wickets: number;
  bowlingAverage: number;
  economyRate: number;
  bestBowling: string;
  catches: number;
  stumpings: number;
}

export interface IPLPlayer {
  id: string;

  fullName: string;
  displayName: string;

  nationality: string;
  isOverseas: boolean;

  primaryRole: IPLPlayerRole;
  battingStyle: IPLBattingStyle;
  bowlingStyle: IPLBowlingStyle;

  currentFranchiseId: string | null;

  season: number;
  status: IPLPlayerStatus;
  contractStatus: IPLContractStatus;

  auctionBasePrice: number | null;
  auctionPrice: number | null;

  jerseyNumber: number | null;

  seasonStats: IPLPlayerSeasonStats[];

  dataSource: string;
  lastVerified: string;
}

export interface IPLPlayerDatabase {
  season: number;
  competition: "IPL";
  lastUpdated: string;
  players: IPLPlayer[];
}
