
export type BattingShot =
  | "defensive"
  | "straight-drive"
  | "cover-drive"
  | "square-drive"
  | "on-drive"
  | "flick"
  | "pull"
  | "hook"
  | "cut"
  | "late-cut"
  | "sweep"
  | "reverse-sweep"
  | "slog-sweep"
  | "lofted-drive"
  | "helicopter";

export type FootworkType =
  | "front-foot"
  | "back-foot"
  | "crease"
  | "advance"
  | "shuffle";

export type ShotDirection =
  | "straight"
  | "off-side"
  | "leg-side"
  | "behind-square"
  | "in-front"
  | "fine-leg"
  | "third-man";

export interface BatterAttributes {
  playerId: string;
  name: string;
  technique: number;
  timing: number;
  power: number;
  placement: number;
  footwork: number;
  aggression: number;
  composure: number;
  stamina: number;
}

export interface BattingInput {
  shot: BattingShot;
  footwork: FootworkType;
  direction: ShotDirection;
  power: number;
  timingInput: number;
}

export interface BattingConditions {
  pitchType: "flat" | "green" | "dry" | "dusty" | "balanced";
  ballAge: number;
  fieldingPressure: number;
  matchPressure: number;
  isDayNight: boolean;
}

export interface BowlingChallenge {
  pace: number;
  movement: number;
  accuracy: number;
  difficulty: number;
  line: string;
  length: string;
}

export interface BattingOutcome {
  shot: BattingShot;
  timingQuality: number;
  contactQuality: number;
  powerGenerated: number;
  placementQuality: number;
  footworkQuality: number;
  executionScore: number;
  riskLevel: "low" | "medium" | "high";
  likelyRuns: number;
  boundaryChance: number;
  wicketChance: number;
}

const clamp = (
  value: number,
  minimum: number,
  maximum: number,
): number => Math.max(minimum, Math.min(maximum, value));

function validateBatter(batter: BatterAttributes): void {
  const attributes = [
    batter.technique,
    batter.timing,
    batter.power,
    batter.placement,
    batter.footwork,
    batter.aggression,
    batter.composure,
    batter.stamina,
  ];

  if (
    attributes.some(
      (value) =>
        !Number.isFinite(value) || value < 0 || value > 100,
    )
  ) {
    throw new Error("Batter attributes must be between 0 and 100.");
  }
}

function getFootworkCompatibility(
  shot: BattingShot,
  footwork: FootworkType,
): number {
  const compatible: Record<BattingShot, FootworkType[]> = {
    defensive: ["front-foot", "back-foot", "crease"],
    "straight-drive": ["front-foot", "advance"],
    "cover-drive": ["front-foot", "advance"],
    "square-drive": ["front-foot", "back-foot"],
    "on-drive": ["front-foot", "advance"],
    flick: ["front-foot", "back-foot", "shuffle"],
    pull: ["back-foot", "shuffle"],
    hook: ["back-foot", "shuffle"],
    cut: ["back-foot", "shuffle"],
    "late-cut": ["back-foot", "crease"],
    sweep: ["front-foot", "shuffle"],
    "reverse-sweep": ["front-foot", "shuffle"],
    "slog-sweep": ["front-foot", "advance"],
    "lofted-drive": ["front-foot", "advance"],
    helicopter: ["front-foot", "shuffle", "advance"],
  };

  return compatible[shot].includes(footwork) ? 100 : 55;
}

function getShotRisk(shot: BattingShot): number {
  const risk: Record<BattingShot, number> = {
    defensive: 5,
    "straight-drive": 20,
    "cover-drive": 30,
    "square-drive": 28,
    "on-drive": 22,
    flick: 20,
    pull: 35,
    hook: 50,
    cut: 30,
    "late-cut": 35,
    sweep: 40,
    "reverse-sweep": 65,
    "slog-sweep": 60,
    "lofted-drive": 50,
    helicopter: 55,
  };

  return risk[shot];
}

function getDirectionBonus(
  shot: BattingShot,
  direction: ShotDirection,
): number {
  const preferred: Record<BattingShot, ShotDirection[]> = {
    defensive: ["straight", "off-side", "leg-side"],
    "straight-drive": ["straight", "in-front"],
    "cover-drive": ["off-side", "in-front"],
    "square-drive": ["off-side", "behind-square"],
    "on-drive": ["straight", "leg-side"],
    flick: ["leg-side", "fine-leg"],
    pull: ["leg-side", "behind-square"],
    hook: ["leg-side", "fine-leg"],
    cut: ["off-side", "behind-square"],
    "late-cut": ["third-man", "off-side"],
    sweep: ["leg-side", "fine-leg"],
    "reverse-sweep": ["third-man", "off-side"],
    "slog-sweep": ["leg-side", "behind-square"],
    "lofted-drive": ["straight", "off-side"],
    helicopter: ["straight", "leg-side"],
  };

  return preferred[shot].includes(direction) ? 100 : 60;
}

function getPitchPenalty(
  conditions: BattingConditions,
): number {
  switch (conditions.pitchType) {
    case "flat":
      return 0;
    case "balanced":
      return 5;
    case "green":
      return 12;
    case "dry":
      return 9;
    case "dusty":
      return 14;
  }
}

export function simulateBattingShot(
  batter: BatterAttributes,
  input: BattingInput,
  bowling: BowlingChallenge,
  conditions: BattingConditions,
): BattingOutcome {
  validateBatter(batter);

  if (
    !Number.isFinite(input.power) ||
    input.power < 0 ||
    input.power > 100 ||
    !Number.isFinite(input.timingInput) ||
    input.timingInput < 0 ||
    input.timingInput > 100
  ) {
    throw new Error("Power and timing input must be between 0 and 100.");
  }

  const bowlingValues = [
    bowling.pace,
    bowling.movement,
    bowling.accuracy,
    bowling.difficulty,
  ];

  if (
    bowlingValues.some(
      (value) => !Number.isFinite(value) || value < 0 || value > 160,
    )
  ) {
    throw new Error("Invalid bowling challenge values.");
  }

  const timingDifference = Math.abs(
    batter.timing - input.timingInput,
  );

  const timingQuality = clamp(
    100 - timingDifference * 1.5,
    0,
    100,
  );

  const footworkQuality =
    getFootworkCompatibility(input.shot, input.footwork) *
    (0.65 + batter.footwork / 300);

  const pitchPenalty = getPitchPenalty(conditions);

  const contactQuality = clamp(
    batter.technique * 0.35 +
      timingQuality * 0.4 +
      footworkQuality * 0.25 -
      bowling.difficulty * 0.15 -
      pitchPenalty,
    0,
    100,
  );

  const powerGenerated = clamp(
    batter.power * 0.55 +
      input.power * 0.45 -
      (100 - batter.stamina) * 0.15,
    0,
    100,
  );

  const placementQuality = clamp(
    batter.placement * 0.55 +
      getDirectionBonus(input.shot, input.direction) * 0.3 +
      timingQuality * 0.15 -
      conditions.fieldingPressure * 0.15,
    0,
    100,
  );

  const shotRisk = getShotRisk(input.shot);

  const executionScore = clamp(
    contactQuality * 0.4 +
      powerGenerated * 0.2 +
      placementQuality * 0.25 +
      batter.composure * 0.15 -
      shotRisk * 0.12,
    0,
    100,
  );

  const riskLevel: BattingOutcome["riskLevel"] =
    shotRisk >= 50
      ? "high"
      : shotRisk >= 25
        ? "medium"
        : "low";

  const likelyRuns =
    executionScore >= 90 && powerGenerated >= 75
      ? 6
      : executionScore >= 80 && powerGenerated >= 60
        ? 4
        : executionScore >= 65
          ? 2
          : executionScore >= 45
            ? 1
            : 0;

  const boundaryChance = clamp(
    (executionScore - 45) * 1.2 +
      powerGenerated * 0.25 -
      shotRisk * 0.4,
    0,
    95,
  );

  const wicketChance = clamp(
    4 +
      shotRisk * 0.35 +
      bowling.difficulty * 0.2 +
      (100 - timingQuality) * 0.25 -
      batter.composure * 0.08,
    1,
    65,
  );

  return {
    shot: input.shot,
    timingQuality: Number(timingQuality.toFixed(1)),
    contactQuality: Number(contactQuality.toFixed(1)),
    powerGenerated: Number(powerGenerated.toFixed(1)),
    placementQuality: Number(placementQuality.toFixed(1)),
    footworkQuality: Number(footworkQuality.toFixed(1)),
    executionScore: Number(executionScore.toFixed(1)),
    riskLevel,
    likelyRuns,
    boundaryChance: Number(boundaryChance.toFixed(1)),
    wicketChance: Number(wicketChance.toFixed(1)),
  };
}

export function getBattingRating(
  batter: BatterAttributes,
): number {
  validateBatter(batter);

  return Math.round(
    batter.technique * 0.2 +
      batter.timing * 0.2 +
      batter.power * 0.15 +
      batter.placement * 0.15 +
      batter.footwork * 0.1 +
      batter.composure * 0.1 +
      batter.stamina * 0.1,
  );
}

export function getShotDescription(
  shot: BattingShot,
): string {
  const descriptions: Record<BattingShot, string> = {
    defensive: "A controlled defensive shot.",
    "straight-drive": "A straight shot down the ground.",
    "cover-drive": "A front-foot shot through the covers.",
    "square-drive": "A drive played square on the off side.",
    "on-drive": "A controlled shot towards mid-on.",
    flick: "A wrist-driven shot towards the leg side.",
    pull: "A back-foot horizontal-bat shot.",
    hook: "An attacking shot against a short delivery.",
    cut: "A square shot through the off side.",
    "late-cut": "A late shot towards third man.",
    sweep: "A low shot against spin.",
    "reverse-sweep": "A reverse-bat sweep.",
    "slog-sweep": "An attacking sweep intended for distance.",
    "lofted-drive": "An aerial drive down the ground.",
    helicopter: "A powerful wrist-driven finishing shot.",
  };

  return descriptions[shot];
}
