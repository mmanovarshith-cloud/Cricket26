
export interface PlayerMatchPerformance {
  playerId: string;
  matchId: string;
  season: number;
  runsScored: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  wicketsTaken: number;
  runsConceded: number;
  oversBowled: number;
  catches: number;
  runOuts: number;
  stumpings: number;
  playerOfTheMatch: boolean;
}

export interface PlayerSeasonSummary {
  playerId: string;
  season: number;
  matches: number;
  totalRuns: number;
  totalBallsFaced: number;
  totalFours: number;
  totalSixes: number;
  totalWickets: number;
  totalRunsConceded: number;
  totalOversBowled: number;
  totalCatches: number;
  totalRunOuts: number;
  totalStumpings: number;
  playerOfTheMatchAwards: number;
  battingAverage: number;
  strikeRate: number;
  bowlingEconomy: number;
}

function validatePerformance(
  performance: PlayerMatchPerformance,
): void {
  if (!performance.playerId.trim() || !performance.matchId.trim()) {
    throw new Error("Player ID and match ID are required.");
  }

  if (!Number.isInteger(performance.season) || performance.season < 2000) {
    throw new Error("Invalid season.");
  }

  const values = [
    performance.runsScored,
    performance.ballsFaced,
    performance.fours,
    performance.sixes,
    performance.wicketsTaken,
    performance.runsConceded,
    performance.oversBowled,
    performance.catches,
    performance.runOuts,
    performance.stumpings,
  ];

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Performance statistics cannot be negative or invalid.");
  }

  if (
    !Number.isInteger(performance.ballsFaced) ||
    !Number.isInteger(performance.runsScored) ||
    !Number.isInteger(performance.wicketsTaken)
  ) {
    throw new Error("Runs, balls, and wickets must be whole numbers.");
  }
}

export function recordPlayerPerformance(
  history: PlayerMatchPerformance[],
  performance: PlayerMatchPerformance,
): PlayerMatchPerformance[] {
  validatePerformance(performance);

  const duplicate = history.some(
    (entry) =>
      entry.playerId === performance.playerId &&
      entry.matchId === performance.matchId,
  );

  if (duplicate) {
    throw new Error("This player's performance is already recorded for this match.");
  }

  return [...history, { ...performance }];
}

export function calculatePlayerSeasonSummary(
  history: PlayerMatchPerformance[],
  playerId: string,
  season: number,
): PlayerSeasonSummary {
  const entries = history.filter(
    (entry) =>
      entry.playerId === playerId &&
      entry.season === season,
  );

  entries.forEach(validatePerformance);

  const total = (
    key: keyof Pick<
      PlayerMatchPerformance,
      | "runsScored"
      | "ballsFaced"
      | "fours"
      | "sixes"
      | "wicketsTaken"
      | "runsConceded"
      | "oversBowled"
      | "catches"
      | "runOuts"
      | "stumpings"
    >
  ): number =>
    entries.reduce((sum, entry) => sum + entry[key], 0);

  const totalRuns = total("runsScored");
  const totalBallsFaced = total("ballsFaced");
  const totalWickets = total("wicketsTaken");
  const totalRunsConceded = total("runsConceded");
  const totalOversBowled = total("oversBowled");

  const dismissals = entries.filter(
    (entry) => entry.runsScored >= 0,
  ).length;

  return {
    playerId,
    season,
    matches: entries.length,
    totalRuns,
    totalBallsFaced,
    totalFours: total("fours"),
    totalSixes: total("sixes"),
    totalWickets,
    totalRunsConceded,
    totalOversBowled,
    totalCatches: total("catches"),
    totalRunOuts: total("runOuts"),
    totalStumpings: total("stumpings"),
    playerOfTheMatchAwards: entries.filter(
      (entry) => entry.playerOfTheMatch,
    ).length,
    battingAverage: dismissals > 0
      ? Number((totalRuns / dismissals).toFixed(2))
      : 0,
    strikeRate: totalBallsFaced > 0
      ? Number(((totalRuns / totalBallsFaced) * 100).toFixed(2))
      : 0,
    bowlingEconomy: totalOversBowled > 0
      ? Number((totalRunsConceded / totalOversBowled).toFixed(2))
      : 0,
  };
}

export function getPlayerCareerHistory(
  history: PlayerMatchPerformance[],
  playerId: string,
): PlayerMatchPerformance[] {
  return history
    .filter((entry) => entry.playerId === playerId)
    .sort((a, b) => a.season - b.season);
}

export function getPlayerBestPerformance(
  history: PlayerMatchPerformance[],
  playerId: string,
): PlayerMatchPerformance | null {
  const entries = history.filter(
    (entry) => entry.playerId === playerId,
  );

  if (entries.length === 0) return null;

  return entries.reduce((best, current) => {
    const currentScore =
      current.runsScored +
      current.wicketsTaken * 20 +
      current.catches * 5 +
      current.runOuts * 5 +
      current.stumpings * 5;

    const bestScore =
      best.runsScored +
      best.wicketsTaken * 20 +
      best.catches * 5 +
      best.runOuts * 5 +
      best.stumpings * 5;

    return currentScore > bestScore ? current : best;
  });
}

export function getSeasonLeaderboard(
  history: PlayerMatchPerformance[],
  season: number,
): PlayerSeasonSummary[] {
  const playerIds = [
    ...new Set(
      history
        .filter((entry) => entry.season === season)
        .map((entry) => entry.playerId),
    ),
  ];

  return playerIds
    .map((playerId) =>
      calculatePlayerSeasonSummary(history, playerId, season),
    )
    .sort((a, b) => b.totalRuns - a.totalRuns);
}
