
export const GAME_CONFIG = {
  name: 'World Cricket Zenith',
  version: '1.0.0',
  defaultSeason: 2027,
  targetFrameRate: 60,
} as const;

export const TOURNAMENT_CONFIG = {
  teamCount: 10,
  squadMinimum: 15,
  squadMaximum: 25,
  maximumOverseasSquadPlayers: 8,
  playingXI: 11,
  maximumOverseasPlayingXI: 4,
  leagueOvers: 20,
  knockoutOvers: 20,
  pointsForWin: 2,
  pointsForTieOrNoResult: 1,
} as const;

export const AUCTION_CONFIG = {
  startingPurse: 120_000_000,
  minimumBidIncrement: 500_000,
  maximumSquadSize: 25,
  minimumSquadSize: 15,
} as const;

export const MATCH_CONFIG = {
  powerplayOvers: 6,
  maximumWickets: 10,
  ballsPerOver: 6,
  defaultOvers: 20,
  maximumReviewCount: 2,
} as const;

export const PLAYER_RATING_CONFIG = {
  minimum: 0,
  maximum: 100,
  elite: 90,
  worldClass: 85,
  excellent: 80,
  good: 70,
  average: 60,
} as const;

export const GAME_MODES = [
  {
    id: 'quick-match',
    title: 'Quick Match',
    description: 'Jump straight into a cricket match.',
  },
  {
    id: 'franchise',
    title: 'Franchise Career',
    description: 'Build and manage your own cricket franchise.',
  },
  {
    id: 'tournament',
    title: 'World Tournament',
    description: 'Compete through a complete tournament.',
  },
  {
    id: 'auction',
    title: 'Mega Auction',
    description: 'Build your dream squad through player auctions.',
  },
] as const;
