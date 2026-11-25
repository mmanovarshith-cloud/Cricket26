
export type UmpireDecisionType =
  | "lbw"
  | "caught"
  | "run-out"
  | "stumping"
  | "boundary"
  | "wide"
  | "no-ball";

export type UmpireDecision =
  | "out"
  | "not-out"
  | "four"
  | "six"
  | "wide"
  | "no-ball";

export type ReviewOutcome =
  | "upheld"
  | "overturned"
  | "umpires-call";

export interface UmpireProfile {
  umpireId: string;
  name: string;
  decisionAccuracy: number;
  experience: number;
  pressureHandling: number;
}

export interface UmpireReview {
  reviewId: string;
  matchId: string;
  decisionType: UmpireDecisionType;
  originalDecision: UmpireDecision;
  finalDecision: UmpireDecision;
  outcome: ReviewOutcome;
  reviewedBy: string;
  confidence: number;
  createdAt: number;
}

export interface DecisionReviewInput {
  matchId: string;
  decisionType: UmpireDecisionType;
  originalDecision: UmpireDecision;
  correctDecision: UmpireDecision;
  umpire: UmpireProfile;
  reviewAvailable: boolean;
  reviewConfidence: number;
}

function validatePercentage(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${name} must be between 0 and 100.`);
  }
}

export function validateUmpire(
  umpire: UmpireProfile,
): void {
  if (!umpire.umpireId.trim() || !umpire.name.trim()) {
    throw new Error("Umpire identity is required.");
  }

  validatePercentage(umpire.decisionAccuracy, "Decision accuracy");
  validatePercentage(umpire.experience, "Experience");
  validatePercentage(umpire.pressureHandling, "Pressure handling");
}

export function calculateUmpireReliability(
  umpire: UmpireProfile,
  pressureLevel: number,
): number {
  validateUmpire(umpire);
  validatePercentage(pressureLevel, "Pressure level");

  const reliability =
    umpire.decisionAccuracy * 0.65 +
    umpire.experience * 0.2 +
    umpire.pressureHandling * 0.15;

  const pressurePenalty =
    pressureLevel *
    (100 - umpire.pressureHandling) /
    500;

  return Math.max(
    0,
    Math.min(100, reliability - pressurePenalty),
  );
}

export function resolveUmpireDecision(
  input: DecisionReviewInput,
): UmpireReview {
  validateUmpire(input.umpire);
  validatePercentage(input.reviewConfidence, "Review confidence");

  if (!input.matchId.trim()) {
    throw new Error("Match ID is required.");
  }

  const wasCorrect =
    input.originalDecision === input.correctDecision;

  let finalDecision = input.originalDecision;
  let outcome: ReviewOutcome = "upheld";

  if (!wasCorrect && input.reviewAvailable) {
    if (input.reviewConfidence >= 90) {
      finalDecision = input.correctDecision;
      outcome = "overturned";
    } else if (input.reviewConfidence >= 70) {
      outcome = "umpires-call";
    }
  }

  return {
    reviewId: `review-${input.matchId}-${Date.now()}`,
    matchId: input.matchId,
    decisionType: input.decisionType,
    originalDecision: input.originalDecision,
    finalDecision,
    outcome,
    reviewedBy: input.umpire.umpireId,
    confidence: input.reviewConfidence,
    createdAt: Date.now(),
  };
}

export function calculateDecisionAccuracy(
  reviews: UmpireReview[],
  umpireId: string,
): number {
  const umpireReviews = reviews.filter(
    (review) => review.reviewedBy === umpireId,
  );

  if (umpireReviews.length === 0) return 0;

  const upheld = umpireReviews.filter(
    (review) => review.outcome === "upheld",
  ).length;

  return Number(
    ((upheld / umpireReviews.length) * 100).toFixed(2),
  );
}

export function getMatchReviews(
  reviews: UmpireReview[],
  matchId: string,
): UmpireReview[] {
  return reviews.filter(
    (review) => review.matchId === matchId,
  );
}
