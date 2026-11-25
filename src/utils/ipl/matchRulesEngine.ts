
export type MatchFormat = "T20" | "ODI" | "TEST";

export type ExtraType =
  | "wide"
  | "no-ball"
  | "bye"
  | "leg-bye"
  | "penalty";

export type DismissalType =
  | "bowled"
  | "caught"
  | "lbw"
  | "run-out"
  | "stumped"
  | "hit-wicket"
  | "obstructing-field"
  | "hit-ball-twice"
  | "retired-out";

export interface MatchRules {
  format: MatchFormat;
  oversPerInnings: number;
  maxOversPerBowler: number;
  maxWickets: number;
  powerplayOvers: number;
  maxFieldersOutsideCircle: number;
  freeHitAfterNoBall: boolean;
}

export interface DeliveryInput {
  batterRuns: number;
  extraType?: ExtraType;
  extraRuns?: number;
  dismissal?: DismissalType;
  isLegalDelivery?: boolean;
  isFreeHit?: boolean;
}

export interface DeliveryDecision {
  isLegalDelivery: boolean;
  totalRuns: number;
  batterRuns: number;
  bowlerRuns: number;
  extras: number;
  extraType?: ExtraType;
  isWicket: boolean;
  dismissal?: DismissalType;
  freeHitNextBall: boolean;
  countsTowardOver: boolean;
}

export interface InningsProgress {
  totalRuns: number;
  wickets: number;
  legalBalls: number;
  overs: number;
  ballsInCurrentOver: number;
  isComplete: boolean;
  freeHitActive: boolean;
}

export const DEFAULT_MATCH_RULES: Record<
  MatchFormat,
  MatchRules
> = {
  T20: {
    format: "T20",
    oversPerInnings: 20,
    maxOversPerBowler: 4,
    maxWickets: 10,
    powerplayOvers: 6,
    maxFieldersOutsideCircle: 5,
    freeHitAfterNoBall: true,
  },
  ODI: {
    format: "ODI",
    oversPerInnings: 50,
    maxOversPerBowler: 10,
    maxWickets: 10,
    powerplayOvers: 10,
    maxFieldersOutsideCircle: 5,
    freeHitAfterNoBall: true,
  },
  TEST: {
    format: "TEST",
    oversPerInnings: 0,
    maxOversPerBowler: 0,
    maxWickets: 10,
    powerplayOvers: 0,
    maxFieldersOutsideCircle: 9,
    freeHitAfterNoBall: false,
  },
};

export function createInningsProgress(): InningsProgress {
  return {
    totalRuns: 0,
    wickets: 0,
    legalBalls: 0,
    overs: 0,
    ballsInCurrentOver: 0,
    isComplete: false,
    freeHitActive: false,
  };
}

function validateDelivery(input: DeliveryInput): void {
  if (
    !Number.isInteger(input.batterRuns) ||
    input.batterRuns < 0 ||
    input.batterRuns > 6
  ) {
    throw new Error("Batter runs must be an integer from 0 to 6.");
  }

  if (
    input.extraRuns !== undefined &&
    (!Number.isInteger(input.extraRuns) || input.extraRuns < 0)
  ) {
    throw new Error("Extra runs must be a non-negative integer.");
  }

  if (input.dismissal && input.dismissal === "retired-out" &&
      input.isFreeHit) {
    throw new Error("Invalid dismissal combination.");
  }
}

export function resolveDeliveryRules(
  input: DeliveryInput,
  freeHitActive: boolean,
): DeliveryDecision {
  validateDelivery(input);

  const extraRuns = input.extraRuns ?? 0;
  const extraType = input.extraType;

  let isLegalDelivery = input.isLegalDelivery ?? true;
  let bowlerRuns = input.batterRuns;
  let extras = extraRuns;
  let isWicket = Boolean(input.dismissal);
  let dismissal = input.dismissal;

  if (extraType === "wide") {
    isLegalDelivery = false;
    extras = Math.max(1, extraRuns);
    bowlerRuns += extras;
    isWicket =
      dismissal === "stumped" ||
      dismissal === "run-out" ||
      dismissal === "obstructing-field" ||
      dismissal === "hit-wicket";

    if (!isWicket) dismissal = undefined;
  } else if (extraType === "no-ball") {
    isLegalDelivery = false;
    extras = Math.max(1, extraRuns);
    bowlerRuns += extras;

    if (
      freeHitActive &&
      dismissal &&
      dismissal !== "run-out" &&
      dismissal !== "obstructing-field"
    ) {
      isWicket = false;
      dismissal = undefined;
    } else if (
      dismissal &&
      dismissal !== "run-out" &&
      dismissal !== "obstructing-field" &&
      dismissal !== "hit-wicket"
    ) {
      isWicket = false;
      dismissal = undefined;
    }
  } else if (
    extraType === "bye" ||
    extraType === "leg-bye" ||
    extraType === "penalty"
  ) {
    bowlerRuns = input.batterRuns;
    extras = extraRuns;
  }

  if (freeHitActive && dismissal) {
    if (
      dismissal !== "run-out" &&
      dismissal !== "obstructing-field"
    ) {
      isWicket = false;
      dismissal = undefined;
    }
  }

  if (input.isFreeHit && extraType === "no-ball") {
    isLegalDelivery = false;
  }

  const freeHitNextBall =
    extraType === "no-ball";

  const totalRuns =
    input.batterRuns + extras;

  return {
    isLegalDelivery,
    totalRuns,
    batterRuns: input.batterRuns,
    bowlerRuns,
    extras,
    extraType,
    isWicket,
    dismissal,
    freeHitNextBall,
    countsTowardOver: isLegalDelivery,
  };
}

export function applyDeliveryToProgress(
  progress: InningsProgress,
  decision: DeliveryDecision,
  rules: MatchRules,
): InningsProgress {
  const next: InningsProgress = {
    ...progress,
    totalRuns: progress.totalRuns + decision.totalRuns,
    wickets: progress.wickets + (decision.isWicket ? 1 : 0),
    legalBalls:
      progress.legalBalls + (decision.isLegalDelivery ? 1 : 0),
    freeHitActive: decision.freeHitNextBall,
  };

  next.overs = Math.floor(next.legalBalls / 6);
  next.ballsInCurrentOver = next.legalBalls % 6;

  const oversLimitReached =
    rules.oversPerInnings > 0 &&
    next.legalBalls >= rules.oversPerInnings * 6;

  next.isComplete =
    next.wickets >= rules.maxWickets ||
    oversLimitReached;

  return next;
}

export function isPowerplay(
  progress: InningsProgress,
  rules: MatchRules,
): boolean {
  if (rules.powerplayOvers <= 0) return false;

  return progress.legalBalls < rules.powerplayOvers * 6;
}

export function getCurrentOverDisplay(
  progress: InningsProgress,
): string {
  return `${progress.overs}.${progress.ballsInCurrentOver}`;
}

export function getInningsRunRate(
  progress: InningsProgress,
): number {
  if (progress.legalBalls === 0) return 0;

  return Number(
    (progress.totalRuns / (progress.legalBalls / 6)).toFixed(2),
  );
}

export function getRequiredRunRate(
  target: number,
  progress: InningsProgress,
  rules: MatchRules,
): number | null {
  if (!Number.isFinite(target) || target < 0) {
    throw new Error("Target must be a non-negative number.");
  }

  if (rules.oversPerInnings <= 0) return null;

  const runsNeeded = Math.max(0, target - progress.totalRuns);
  const ballsRemaining = Math.max(
    0,
    rules.oversPerInnings * 6 - progress.legalBalls,
  );

  if (ballsRemaining === 0) {
    return runsNeeded === 0 ? 0 : null;
  }

  return Number(
    (runsNeeded / (ballsRemaining / 6)).toFixed(2),
  );
}
