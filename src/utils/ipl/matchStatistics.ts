
export interface BattingInningsRecord {
  playerId: string;
  playerName: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  dismissed: boolean;
}

export interface BowlingInningsRecord {
  playerId: string;
  playerName: string;
  ballsBowled: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  wides: number;
  noBalls: number;
}

export interface PlayerMatchStatistics {
  playerId: string;
  playerName: string;
  battingRuns: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  battingStrikeRate: number;
  bowlingBalls: number;
  bowlingRuns: number;
  bowlingWickets: number;
  bowlingEconomy: number;
  bowlingAverage: number | null;
  bowlingStrikeRate: number | null;
}

export interface TeamMatchStatistics {
  runs: number;
  wickets: number;
  legalBalls: number;
  overs: string;
  runRate: number;
  boundaries: number;
  extras: number;
}

export interface MatchLeaders {
  topScorer: PlayerMatchStatistics | null;
  mostWickets: PlayerMatchStatistics | null;
  highestStrikeRate: PlayerMatchStatistics | null;
  bestEconomy: PlayerMatchStatistics | null;
}

function round(value: number, decimals = 2): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function validateNonNegativeInteger(
  value: number,
  fieldName: string,
): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative integer.`);
  }
}

export function calculateStrikeRate(
  runs: number,
  ballsFaced: number,
): number {
  validateNonNegativeInteger(runs, "Runs");
  validateNonNegativeInteger(ballsFaced, "Balls faced");

  if (ballsFaced === 0) return 0;

  return round((runs / ballsFaced) * 100);
}

export function calculateBowlingEconomy(
  runsConceded: number,
  ballsBowled: number,
): number {
  validateNonNegativeInteger(runsConceded, "Runs conceded");
  validateNonNegativeInteger(ballsBowled, "Balls bowled");

  if (ballsBowled === 0) return 0;

  return round((runsConceded * 6) / ballsBowled);
}

export function calculateBowlingAverage(
  runsConceded: number,
  wickets: number,
): number | null {
  validateNonNegativeInteger(runsConceded, "Runs conceded");
  validateNonNegativeInteger(wickets, "Wickets");

  if (wickets === 0) return null;

  return round(runsConceded / wickets);
}

export function calculateBowlingStrikeRate(
  ballsBowled: number,
  wickets: number,
): number | null {
  validateNonNegativeInteger(ballsBowled, "Balls bowled");
  validateNonNegativeInteger(wickets, "Wickets");

  if (wickets === 0) return null;

  return round(ballsBowled / wickets);
}

export function formatOvers(balls: number): string {
  validateNonNegativeInteger(balls, "Balls");

  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;

  return `${overs}.${remainingBalls}`;
}

export function calculateTeamStatistics(
  runs: number,
  wickets: number,
  legalBalls: number,
  boundaries: number,
  extras: number,
): TeamMatchStatistics {
  validateNonNegativeInteger(runs, "Runs");
  validateNonNegativeInteger(wickets, "Wickets");
  validateNonNegativeInteger(legalBalls, "Legal balls");
  validateNonNegativeInteger(boundaries, "Boundaries");
  validateNonNegativeInteger(extras, "Extras");

  if (wickets > 10) {
    throw new Error("An innings cannot have more than 10 wickets.");
  }

  if (boundaries > runs) {
    throw new Error("Boundary count cannot exceed total runs.");
  }

  return {
    runs,
    wickets,
    legalBalls,
    overs: formatOvers(legalBalls),
    runRate:
      legalBalls === 0
        ? 0
        : round((runs * 6) / legalBalls),
    boundaries,
    extras,
  };
}

export function buildPlayerStatistics(
  batting: BattingInningsRecord,
  bowling?: BowlingInningsRecord,
): PlayerMatchStatistics {
  const bowlingBalls = bowling?.ballsBowled ?? 0;
  const bowlingRuns = bowling?.runsConceded ?? 0;
  const bowlingWickets = bowling?.wickets ?? 0;

  const battingValues = [
    batting.runs,
    batting.ballsFaced,
    batting.fours,
    batting.sixes,
  ];

  battingValues.forEach((value, index) => {
    validateNonNegativeInteger(value, `Batting statistic ${index + 1}`);
  });

  if (
    batting.fours * 4 + batting.sixes * 6 >
    batting.runs
  ) {
    throw new Error("Boundary runs cannot exceed batter runs.");
  }

  if (bowling) {
    [
      bowling.ballsBowled,
      bowling.runsConceded,
      bowling.wickets,
      bowling.maidens,
      bowling.wides,
      bowling.noBalls,
    ].forEach((value, index) => {
      validateNonNegativeInteger(value, `Bowling statistic ${index + 1}`);
    });
  }

  return {
    playerId: batting.playerId,
    playerName: batting.playerName,
    battingRuns: batting.runs,
    ballsFaced: batting.ballsFaced,
    fours: batting.fours,
    sixes: batting.sixes,
    battingStrikeRate: calculateStrikeRate(
      batting.runs,
      batting.ballsFaced,
    ),
    bowlingBalls,
    bowlingRuns,
    bowlingWickets,
    bowlingEconomy: calculateBowlingEconomy(
      bowlingRuns,
      bowlingBalls,
    ),
    bowlingAverage: calculateBowlingAverage(
      bowlingRuns,
      bowlingWickets,
    ),
    bowlingStrikeRate: calculateBowlingStrikeRate(
      bowlingBalls,
      bowlingWickets,
    ),
  };
}

export function getMatchLeaders(
  players: PlayerMatchStatistics[],
): MatchLeaders {
  const topScorer = [...players]
    .filter((player) => player.ballsFaced > 0)
    .sort((a, b) => b.battingRuns - a.battingRuns)[0] ?? null;

  const mostWickets = [...players]
    .filter((player) => player.bowlingWickets > 0)
    .sort((a, b) => b.bowlingWickets - a.bowlingWickets)[0] ?? null;

  const highestStrikeRate = [...players]
    .filter((player) => player.ballsFaced > 0)
    .sort(
      (a, b) =>
        b.battingStrikeRate - a.battingStrikeRate,
    )[0] ?? null;

  const bestEconomy = [...players]
    .filter((player) => player.bowlingBalls > 0)
    .sort(
      (a, b) =>
        a.bowlingEconomy - b.bowlingEconomy,
    )[0] ?? null;

  return {
    topScorer,
    mostWickets,
    highestStrikeRate,
    bestEconomy,
  };
}
