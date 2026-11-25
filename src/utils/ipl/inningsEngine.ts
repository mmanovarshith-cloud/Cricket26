
export type IPLExtraType =
  | "none"
  | "wide"
  | "no-ball"
  | "bye"
  | "leg-bye"
  | "penalty";

export type IPLDismissalType =
  | "bowled"
  | "caught"
  | "lbw"
  | "run-out"
  | "stumped"
  | "hit-wicket"
  | "caught-and-bowled"
  | "retired-out";

export interface IPLBatterScore {
  playerId: string;
  name: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissal: IPLDismissalType | null;
}

export interface IPLBowlerFigures {
  playerId: string;
  name: string;
  legalBalls: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  wides: number;
  noBalls: number;
}

export interface IPLInningsState {
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  wickets: number;
  legalBalls: number;
  totalOvers: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalty: number;
  };
  batters: IPLBatterScore[];
  bowlers: IPLBowlerFigures[];
  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string | null;
  completed: boolean;
  target: number | null;
}

export interface IPLBallEvent {
  batterRuns: number;
  extraType?: IPLExtraType;
  extraRuns?: number;
  wicket?: {
    playerId: string;
    dismissal: IPLDismissalType;
    creditedToBowler?: boolean;
  };
}

export interface IPLScoreResult {
  success: boolean;
  message: string;
  state: IPLInningsState;
}

const MAX_WICKETS = 10;
const BALLS_PER_OVER = 6;
const MAX_OVERS = 20;

export function createIPLInnings(
  battingTeamId: string,
  bowlingTeamId: string,
  batters: Array<{ playerId: string; name: string }>,
  target: number | null = null,
): IPLInningsState {
  if (batters.length < 2) {
    throw new Error("At least two batters are required.");
  }

  if (batters[0].playerId === batters[1].playerId) {
    throw new Error("Striker and non-striker must be different players.");
  }

  return {
    battingTeamId,
    bowlingTeamId,
    totalRuns: 0,
    wickets: 0,
    legalBalls: 0,
    totalOvers: MAX_OVERS,
    extras: {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      penalty: 0,
    },
    batters: batters.map((batter) => ({
      ...batter,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      dismissal: null,
    })),
    bowlers: [],
    strikerId: batters[0].playerId,
    nonStrikerId: batters[1].playerId,
    currentBowlerId: null,
    completed: false,
    target,
  };
}

function findBatter(
  state: IPLInningsState,
  playerId: string,
): IPLBatterScore | undefined {
  return state.batters.find(
    (batter) => batter.playerId === playerId,
  );
}

function findBowler(
  state: IPLInningsState,
  playerId: string,
): IPLBowlerFigures | undefined {
  return state.bowlers.find(
    (bowler) => bowler.playerId === playerId,
  );
}

function getBowler(
  state: IPLInningsState,
  playerId: string,
): IPLBowlerFigures {
  const existing = findBowler(state, playerId);

  if (existing) {
    return existing;
  }

  const bowler: IPLBowlerFigures = {
    playerId,
    name: playerId,
    legalBalls: 0,
    runsConceded: 0,
    wickets: 0,
    maidens: 0,
    wides: 0,
    noBalls: 0,
  };

  state.bowlers.push(bowler);
  return bowler;
}

function swapStrike(state: IPLInningsState): void {
  const previousStriker = state.strikerId;
  state.strikerId = state.nonStrikerId;
  state.nonStrikerId = previousStriker;
}

function completeInningsIfNeeded(state: IPLInningsState): void {
  if (state.wickets >= MAX_WICKETS) {
    state.completed = true;
  }

  if (state.legalBalls >= state.totalOvers * BALLS_PER_OVER) {
    state.completed = true;
  }

  if (
    state.target !== null &&
    state.totalRuns >= state.target
  ) {
    state.completed = true;
  }
}

export function setCurrentBowler(
  state: IPLInningsState,
  bowlerId: string,
): IPLInningsState {
  if (state.completed) {
    throw new Error("The innings has already finished.");
  }

  if (!bowlerId.trim()) {
    throw new Error("A valid bowler ID is required.");
  }

  const updated = {
    ...state,
    bowlers: state.bowlers.map((bowler) => ({ ...bowler })),
    extras: { ...state.extras },
    batters: state.batters.map((batter) => ({ ...batter })),
    currentBowlerId: bowlerId,
  };

  getBowler(updated, bowlerId);

  return updated;
}

export function deliverBall(
  originalState: IPLInningsState,
  event: IPLBallEvent,
): IPLScoreResult {
  const fail = (message: string): IPLScoreResult => ({
    success: false,
    message,
    state: originalState,
  });

  if (originalState.completed) {
    return fail("The innings has already finished.");
  }

  if (!originalState.currentBowlerId) {
    return fail("Select a bowler before delivering the ball.");
  }

  if (
    !Number.isInteger(event.batterRuns) ||
    event.batterRuns < 0 ||
    event.batterRuns > 6
  ) {
    return fail("Invalid batter runs.");
  }

  const extraType = event.extraType ?? "none";
  const extraRuns = event.extraRuns ?? 0;

  if (!Number.isInteger(extraRuns) || extraRuns < 0) {
    return fail("Invalid extra runs.");
  }

  if (extraType === "wide" && event.batterRuns !== 0) {
    return fail("A wide cannot also contain batter runs.");
  }

  if (
    (extraType === "bye" || extraType === "leg-bye") &&
    event.batterRuns !== 0
  ) {
    return fail("Byes and leg-byes cannot count as batter runs.");
  }

  if (
    (extraType === "none" || extraType === "penalty") &&
    extraRuns !== 0
  ) {
    return fail("Unexpected extra runs for this delivery type.");
  }

  if (
    event.wicket &&
    !findBatter(originalState, event.wicket.playerId)
  ) {
    return fail("Dismissed batter was not found.");
  }

  if (
    event.wicket &&
    event.wicket.playerId !== originalState.strikerId &&
    event.wicket.playerId !== originalState.nonStrikerId
  ) {
    return fail("Only a batter currently at the crease can be dismissed.");
  }

  const state: IPLInningsState = {
    ...originalState,
    extras: { ...originalState.extras },
    batters: originalState.batters.map((batter) => ({ ...batter })),
    bowlers: originalState.bowlers.map((bowler) => ({ ...bowler })),
  };

  const bowler = getBowler(state, state.currentBowlerId!);
  const striker = findBatter(state, state.strikerId)!;

  const isWide = extraType === "wide";
  const isNoBall = extraType === "no-ball";
  const isLegalDelivery = !isWide && !isNoBall;

  const batterRuns = isWide ? 0 : event.batterRuns;

  let totalExtras = extraRuns;

  switch (extraType) {
    case "wide":
      totalExtras = Math.max(1, extraRuns);
      state.extras.wides += totalExtras;
      bowler.wides += totalExtras;
      break;

    case "no-ball":
      totalExtras = Math.max(1, extraRuns);
      state.extras.noBalls += totalExtras;
      bowler.noBalls += totalExtras;
      break;

    case "bye":
      state.extras.byes += extraRuns;
      break;

    case "leg-bye":
      state.extras.legByes += extraRuns;
      break;

    case "penalty":
      state.extras.penalty += extraRuns;
      break;
  }

  const teamRuns = batterRuns + totalExtras;

  state.totalRuns += teamRuns;

  if (!isWide && extraType !== "bye" && extraType !== "leg-bye" && extraType !== "penalty") {
    striker.runs += batterRuns;

    if (batterRuns > 0) {
      striker.ballsFaced++;
    }

    if (batterRuns === 4) striker.fours++;
    if (batterRuns === 6) striker.sixes++;
  }

  if (isWide || isNoBall || extraType === "none") {
    bowler.runsConceded += teamRuns;
  }

  if (extraType === "bye") {
    // Byes are not charged to the bowler.
  }

  if (extraType === "leg-bye") {
    // Leg-byes are not charged to the bowler.
  }

  if (extraType === "penalty") {
    // Penalty runs are not charged to the bowler.
  }

  if (isLegalDelivery) {
    state.legalBalls++;
    bowler.legalBalls++;
  }

  if (event.wicket) {
    const dismissed = findBatter(
      state,
      event.wicket.playerId,
    )!;

    dismissed.isOut = true;
    dismissed.dismissal = event.wicket.dismissal;
    state.wickets++;

    const credited =
      event.wicket.creditedToBowler ??
      [
        "bowled",
        "caught",
        "lbw",
        "stumped",
        "hit-wicket",
        "caught-and-bowled",
      ].includes(event.wicket.dismissal);

    if (credited) {
      bowler.wickets++;
    }

    if (dismissed.playerId === state.strikerId) {
      state.strikerId = "";
    } else {
      state.nonStrikerId = "";
    }
  }

  // Strike changes after an odd number of completed runs.
  // Penalty runs do not rotate strike.
  const runningRuns = batterRuns +
    (extraType === "bye" || extraType === "leg-bye"
      ? extraRuns
      : 0);

  if (runningRuns % 2 === 1) {
    swapStrike(state);
  }

  // At the end of a completed over, the batters change ends.
  if (isLegalDelivery && state.legalBalls % BALLS_PER_OVER === 0) {
    swapStrike(state);
  }

  completeInningsIfNeeded(state);

  return {
    success: true,
    message: event.wicket
      ? `${event.wicket.playerId} dismissed.`
      : `${teamRuns} run(s) scored.`,
    state,
  };
}

export function getInningsOvers(
  state: IPLInningsState,
): string {
  const completedOvers = Math.floor(
    state.legalBalls / BALLS_PER_OVER,
  );

  const balls = state.legalBalls % BALLS_PER_OVER;

  return `${completedOvers}.${balls}`;
}

export function getCurrentRunRate(
  state: IPLInningsState,
): number {
  if (state.legalBalls === 0) return 0;

  return Number(
    (
      state.totalRuns /
      (state.legalBalls / BALLS_PER_OVER)
    ).toFixed(2),
  );
}

export function getRequiredRunRate(
  state: IPLInningsState,
): number | null {
  if (state.target === null) return null;

  const runsRemaining = Math.max(
    0,
    state.target - state.totalRuns,
  );

  const ballsRemaining = Math.max(
    0,
    state.totalOvers * BALLS_PER_OVER - state.legalBalls,
  );

  if (ballsRemaining === 0) {
    return runsRemaining === 0 ? 0 : null;
  }

  return Number(
    (
      (runsRemaining / ballsRemaining) * BALLS_PER_OVER
    ).toFixed(2),
  );
}

export function getBattingScorecard(
  state: IPLInningsState,
): IPLBatterScore[] {
  return [...state.batters].sort(
    (a, b) =>
      Number(b.isOut) - Number(a.isOut) ||
      b.runs - a.runs,
  );
}

export function getBowlingScorecard(
  state: IPLInningsState,
): IPLBowlerFigures[] {
  return [...state.bowlers].sort(
    (a, b) => b.wickets - a.wickets ||
      a.runsConceded - b.runsConceded,
  );
}
