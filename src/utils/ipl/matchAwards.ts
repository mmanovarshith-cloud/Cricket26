
export interface AwardPlayerPerformance {
  playerId: string;
  playerName: string;
  franchiseId: string;

  battingRuns: number;
  ballsFaced: number;
  fours: number;
  sixes: number;

  bowlingWickets: number;
  bowlingRunsConceded: number;
  bowlingBalls: number;
  maidenOvers: number;

  catches: number;
  runOuts: number;
  stumpings: number;
}

export interface MatchAward {
  id: string;
  title: string;
  playerId: string;
  playerName: string;
  franchiseId: string;
  performanceScore: number;
  reason: string;
}

export interface MatchAwardResults {
  playerOfTheMatch: MatchAward | null;
  bestBatter: MatchAward | null;
  bestBowler: MatchAward | null;
  bestFielder: MatchAward | null;
}

function validatePerformance(
  player: AwardPlayerPerformance,
): void {
  const values = [
    player.battingRuns,
    player.ballsFaced,
    player.fours,
    player.sixes,
    player.bowlingWickets,
    player.bowlingRunsConceded,
    player.bowlingBalls,
    player.maidenOvers,
    player.catches,
    player.runOuts,
    player.stumpings,
  ];

  if (
    values.some(
      (value) => !Number.isInteger(value) || value < 0,
    )
  ) {
    throw new Error(
      `Invalid performance statistics for ${player.playerName}.`,
    );
  }

  if (
    player.fours * 4 + player.sixes * 6 >
    player.battingRuns
  ) {
    throw new Error(
      `Invalid boundary statistics for ${player.playerName}.`,
    );
  }
}

export function calculateBattingAwardScore(
  player: AwardPlayerPerformance,
): number {
  const strikeRate =
    player.ballsFaced > 0
      ? (player.battingRuns / player.ballsFaced) * 100
      : 0;

  const boundaryRuns =
    player.fours * 4 + player.sixes * 6;

  const nonBoundaryRuns =
    player.battingRuns - boundaryRuns;

  const boundaryBonus =
    player.fours * 0.5 + player.sixes * 1.5;

  const milestoneBonus =
    player.battingRuns >= 100
      ? 30
      : player.battingRuns >= 50
        ? 15
        : 0;

  const strikeRateBonus =
    player.ballsFaced >= 10
      ? Math.max(0, (strikeRate - 100) * 0.15)
      : 0;

  return (
    nonBoundaryRuns +
    boundaryRuns +
    boundaryBonus +
    milestoneBonus +
    strikeRateBonus
  );
}

export function calculateBowlingAwardScore(
  player: AwardPlayerPerformance,
): number {
  const economy =
    player.bowlingBalls > 0
      ? (player.bowlingRunsConceded * 6) /
        player.bowlingBalls
      : 0;

  const economyBonus =
    player.bowlingBalls >= 12
      ? Math.max(0, (9 - economy) * 2)
      : 0;

  const wicketBonus =
    player.bowlingWickets >= 5
      ? 15
      : player.bowlingWickets >= 3
        ? 8
        : 0;

  return (
    player.bowlingWickets * 25 +
    economyBonus +
    wicketBonus +
    player.maidenOvers * 8
  );
}

export function calculateFieldingAwardScore(
  player: AwardPlayerPerformance,
): number {
  return (
    player.catches * 10 +
    player.runOuts * 15 +
    player.stumpings * 12
  );
}

function createAward(
  player: AwardPlayerPerformance,
  title: string,
  score: number,
  reason: string,
): MatchAward {
  return {
    id: `${title.toLowerCase().replaceAll(" ", "-")}-${player.playerId}`,
    title,
    playerId: player.playerId,
    playerName: player.playerName,
    franchiseId: player.franchiseId,
    performanceScore: Math.round(score * 100) / 100,
    reason,
  };
}

function getHighestScoringPlayer(
  players: AwardPlayerPerformance[],
  scoreFunction: (player: AwardPlayerPerformance) => number,
): AwardPlayerPerformance | null {
  if (players.length === 0) return null;

  return [...players].sort(
    (a, b) => scoreFunction(b) - scoreFunction(a),
  )[0];
}

export function calculateMatchAwards(
  players: AwardPlayerPerformance[],
): MatchAwardResults {
  players.forEach(validatePerformance);

  const bestBatterPlayer = getHighestScoringPlayer(
    players,
    calculateBattingAwardScore,
  );

  const bestBowlerPlayer = getHighestScoringPlayer(
    players,
    calculateBowlingAwardScore,
  );

  const bestFielderPlayer = getHighestScoringPlayer(
    players,
    calculateFieldingAwardScore,
  );

  const playerOfTheMatchPlayer = getHighestScoringPlayer(
    players,
    (player) =>
      calculateBattingAwardScore(player) +
      calculateBowlingAwardScore(player) +
      calculateFieldingAwardScore(player),
  );

  const bestBatter = bestBatterPlayer
    ? createAward(
        bestBatterPlayer,
        "Best Batter",
        calculateBattingAwardScore(bestBatterPlayer),
        `${bestBatterPlayer.battingRuns} runs from ${bestBatterPlayer.ballsFaced} balls.`,
      )
    : null;

  const bestBowler = bestBowlerPlayer
    ? createAward(
        bestBowlerPlayer,
        "Best Bowler",
        calculateBowlingAwardScore(bestBowlerPlayer),
        `${bestBowlerPlayer.bowlingWickets} wickets in ${bestBowlerPlayer.bowlingBalls} balls.`,
      )
    : null;

  const bestFielder = bestFielderPlayer
    ? createAward(
        bestFielderPlayer,
        "Best Fielder",
        calculateFieldingAwardScore(bestFielderPlayer),
        `${bestFielderPlayer.catches} catches, ${bestFielderPlayer.runOuts} run-outs and ${bestFielderPlayer.stumpings} stumpings.`,
      )
    : null;

  const playerOfTheMatch = playerOfTheMatchPlayer
    ? createAward(
        playerOfTheMatchPlayer,
        "Player of the Match",
        calculateBattingAwardScore(playerOfTheMatchPlayer) +
          calculateBowlingAwardScore(playerOfTheMatchPlayer) +
          calculateFieldingAwardScore(playerOfTheMatchPlayer),
        "Highest combined batting, bowling and fielding performance score.",
      )
    : null;

  return {
    playerOfTheMatch,
    bestBatter,
    bestBowler,
    bestFielder,
  };
}
