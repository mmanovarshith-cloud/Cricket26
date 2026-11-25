
export type PlayerRecordType =
  | "highest-score"
  | "century"
  | "half-century"
  | "fastest-fifty"
  | "fastest-century"
  | "most-fours"
  | "most-sixes"
  | "five-wicket-haul"
  | "best-bowling"
  | "hat-trick"
  | "most-wickets";

export interface PlayerRecord {
  id: string;
  playerId: string;
  playerName: string;
  franchiseId: string;
  season: number;
  type: PlayerRecordType;
  value: number;
  matchId: string;
  description: string;
  achievedAt: number;
}

export interface PlayerMatchPerformance {
  playerId: string;
  playerName: string;
  franchiseId: string;
  season: number;
  matchId: string;
  battingRuns: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  bowlingWickets: number;
  bowlingRunsConceded: number;
  bowlingBalls: number;
  hatTrick: boolean;
}

function createRecord(
  performance: PlayerMatchPerformance,
  type: PlayerRecordType,
  value: number,
  description: string,
): PlayerRecord {
  return {
    id: `${performance.matchId}-${performance.playerId}-${type}`,
    playerId: performance.playerId,
    playerName: performance.playerName,
    franchiseId: performance.franchiseId,
    season: performance.season,
    type,
    value,
    matchId: performance.matchId,
    description,
    achievedAt: Date.now(),
  };
}

function validatePerformance(
  performance: PlayerMatchPerformance,
): void {
  const values = [
    performance.season,
    performance.battingRuns,
    performance.ballsFaced,
    performance.fours,
    performance.sixes,
    performance.bowlingWickets,
    performance.bowlingRunsConceded,
    performance.bowlingBalls,
  ];

  if (
    values.some(
      (value) => !Number.isInteger(value) || value < 0,
    )
  ) {
    throw new Error("Player performance contains invalid statistics.");
  }

  if (
    performance.fours * 4 + performance.sixes * 6 >
    performance.battingRuns
  ) {
    throw new Error("Boundary runs cannot exceed batting runs.");
  }
}

export function detectPlayerRecords(
  performance: PlayerMatchPerformance,
): PlayerRecord[] {
  validatePerformance(performance);

  const records: PlayerRecord[] = [];

  if (performance.battingRuns >= 100) {
    records.push(
      createRecord(
        performance,
        "century",
        performance.battingRuns,
        `${performance.playerName} scored a century.`,
      ),
    );
  } else if (performance.battingRuns >= 50) {
    records.push(
      createRecord(
        performance,
        "half-century",
        performance.battingRuns,
        `${performance.playerName} scored a half-century.`,
      ),
    );
  }

  if (
    performance.battingRuns >= 50 &&
    performance.ballsFaced > 0
  ) {
    records.push(
      createRecord(
        performance,
        "fastest-fifty",
        Math.round(
          (performance.battingRuns / performance.ballsFaced) * 100,
        ),
        `${performance.playerName} recorded a strike rate of ${Math.round(
          (performance.battingRuns / performance.ballsFaced) * 100,
        )} while scoring at least 50 runs.`,
      ),
    );
  }

  if (
    performance.battingRuns >= 100 &&
    performance.ballsFaced > 0
  ) {
    records.push(
      createRecord(
        performance,
        "fastest-century",
        Math.round(
          (performance.battingRuns / performance.ballsFaced) * 100,
        ),
        `${performance.playerName} scored a century at a strike rate of ${Math.round(
          (performance.battingRuns / performance.ballsFaced) * 100,
        )}.`,
      ),
    );
  }

  if (performance.fours > 0) {
    records.push(
      createRecord(
        performance,
        "most-fours",
        performance.fours,
        `${performance.playerName} hit ${performance.fours} fours.`,
      ),
    );
  }

  if (performance.sixes > 0) {
    records.push(
      createRecord(
        performance,
        "most-sixes",
        performance.sixes,
        `${performance.playerName} hit ${performance.sixes} sixes.`,
      ),
    );
  }

  if (performance.bowlingWickets >= 5) {
    records.push(
      createRecord(
        performance,
        "five-wicket-haul",
        performance.bowlingWickets,
        `${performance.playerName} took ${performance.bowlingWickets} wickets.`,
      ),
    );
  }

  if (performance.bowlingWickets > 0) {
    records.push(
      createRecord(
        performance,
        "best-bowling",
        performance.bowlingWickets * 1000 -
          performance.bowlingRunsConceded,
        `${performance.playerName} took ${performance.bowlingWickets} wickets for ${performance.bowlingRunsConceded} runs.`,
      ),
    );
  }

  if (performance.hatTrick) {
    records.push(
      createRecord(
        performance,
        "hat-trick",
        3,
        `${performance.playerName} achieved a hat-trick.`,
      ),
    );
  }

  return records;
}

export function getPlayerRecords(
  records: PlayerRecord[],
  playerId: string,
): PlayerRecord[] {
  return records
    .filter((record) => record.playerId === playerId)
    .sort((a, b) => b.achievedAt - a.achievedAt);
}

export function getSeasonRecords(
  records: PlayerRecord[],
  season: number,
): PlayerRecord[] {
  return records
    .filter((record) => record.season === season)
    .sort((a, b) => b.achievedAt - a.achievedAt);
}

export function getFranchiseRecords(
  records: PlayerRecord[],
  franchiseId: string,
): PlayerRecord[] {
  return records
    .filter((record) => record.franchiseId === franchiseId)
    .sort((a, b) => b.achievedAt - a.achievedAt);
}

export function getRecordLeaderboard(
  records: PlayerRecord[],
  type: PlayerRecordType,
  limit = 10,
): PlayerRecord[] {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Leaderboard limit must be positive.");
  }

  return records
    .filter((record) => record.type === type)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
