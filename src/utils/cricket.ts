
export type CricketScore = {
  runs: number;
  wickets: number;
  legalBalls: number;
  extras: number;
};

export function formatOvers(legalBalls: number): string {
  const safeBalls = Math.max(0, Math.floor(legalBalls));
  const overs = Math.floor(safeBalls / 6);
  const balls = safeBalls % 6;

  return `${overs}.${balls}`;
}

export function calculateRunRate(
  runs: number,
  legalBalls: number,
): number {
  if (legalBalls <= 0) return 0;

  return Number(((runs * 6) / legalBalls).toFixed(2));
}

export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  legalBallsRemaining: number,
): number {
  const runsNeeded = target - currentRuns;

  if (runsNeeded <= 0) return 0;
  if (legalBallsRemaining <= 0) return Infinity;

  return Number(
    ((runsNeeded * 6) / legalBallsRemaining).toFixed(2),
  );
}

export function calculateStrikeRate(
  runs: number,
  ballsFaced: number,
): number {
  if (ballsFaced <= 0) return 0;

  return Number(((runs * 100) / ballsFaced).toFixed(2));
}

export function calculateEconomyRate(
  runsConceded: number,
  legalBallsBowled: number,
): number {
  if (legalBallsBowled <= 0) return 0;

  return Number(
    ((runsConceded * 6) / legalBallsBowled).toFixed(2),
  );
}

export function getRemainingBalls(
  totalOvers: number,
  legalBallsBowled: number,
): number {
  const totalBalls = Math.max(0, Math.floor(totalOvers * 6));
  const bowledBalls = Math.max(0, Math.floor(legalBallsBowled));

  return Math.max(0, totalBalls - bowledBalls);
}

export function getInningsStatus(
  score: CricketScore,
  totalOvers: number,
): 'in-progress' | 'all-out' | 'overs-complete' {
  if (score.wickets >= 10) return 'all-out';

  if (score.legalBalls >= totalOvers * 6) {
    return 'overs-complete';
  }

  return 'in-progress';
}

export function calculateProjectedScore(
  currentRuns: number,
  legalBalls: number,
  totalOvers: number,
): number {
  if (legalBalls <= 0) return 0;

  const runRate = calculateRunRate(currentRuns, legalBalls);
  return Math.round(runRate * totalOvers);
}
