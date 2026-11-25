
/**
 * WORLD CRICKET ZENITH
 * IPL Season Configuration
 *
 * Central configuration for season selection.
 * Real player records will be added separately.
 */

export type IPLSeasonStatus =
  | "selected"
  | "in-development"
  | "verified"
  | "archived";

export interface IPLSeasonConfig {
  year: number;
  label: string;
  competition: "IPL";
  status: IPLSeasonStatus;
  isDefault: boolean;
  playerDatabaseReady: boolean;
  auctionDatabaseReady: boolean;
  statisticsVerified: boolean;
}

export const DEFAULT_IPL_SEASON = 2026;

export const IPL_SEASONS: IPLSeasonConfig[] = [
  {
    year: 2026,
    label: "Indian Premier League 2026",
    competition: "IPL",
    status: "selected",
    isDefault: true,
    playerDatabaseReady: false,
    auctionDatabaseReady: false,
    statisticsVerified: false,
  },
];

export const getIPLSeason = (
  year: number
): IPLSeasonConfig | undefined => {
  return IPL_SEASONS.find((season) => season.year === year);
};

export const getDefaultIPLSeason = (): IPLSeasonConfig => {
  const season = getIPLSeason(DEFAULT_IPL_SEASON);

  if (!season) {
    throw new Error(
      `Default IPL season ${DEFAULT_IPL_SEASON} is not configured.`
    );
  }

  return season;
};
