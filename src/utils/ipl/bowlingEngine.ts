
export type BowlingType =
  | "fast"
  | "fast-medium"
  | "medium"
  | "off-spin"
  | "leg-spin"
  | "left-arm-spin";

export type BowlingVariation =
  | "stock"
  | "yorker"
  | "bouncer"
  | "slower-ball"
  | "cutter"
  | "inswinger"
  | "outswinger"
  | "googly"
  | "doosra"
  | "flipper"
  | "arm-ball";

export type BowlingLine =
  | "wide-off"
  | "outside-off"
  | "middle"
  | "leg-stump"
  | "wide-leg";

export type BowlingLength =
  | "full-toss"
  | "yorker"
  | "full"
  | "good"
  | "short"
  | "bouncer";

export interface BowlerAttributes {
  playerId: string;
  name: string;
  bowlingType: BowlingType;
  pace: number;
  accuracy: number;
  swing: number;
  seam: number;
  spin: number;
  control: number;
  stamina: number;
  maxOvers: number;
}

export interface BowlingDelivery {
  line: BowlingLine;
  length: BowlingLength;
  variation: BowlingVariation;
  power: number;
}

export interface BowlingConditions {
  pitchType: "flat" | "green" | "dry" | "dusty" | "balanced";
  weather: "sunny" | "cloudy" | "humid" | "rainy";
  dewFactor: number;
}

export interface BowlingOutcome {
  pace: number;
  accuracy: number;
  movement: number;
  control: number;
  difficulty: number;
  staminaCost: number;
  effectiveness: number;
  likelyOutcome:
    | "dot-ball"
    | "defensive"
    | "attacking"
    | "high-risk";
}

export interface BowlerMatchStats {
  playerId: string;
  ballsBowled: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  currentSpellBalls: number;
  staminaRemaining: number;
}

const clamp = (
  value: number,
  minimum: number,
  maximum: number,
): number => Math.max(minimum, Math.min(maximum, value));

const randomBetween = (
  minimum: number,
  maximum: number,
): number => minimum + Math.random() * (maximum - minimum);

function validateAttributes(bowler: BowlerAttributes): void {
  const attributes = [
    bowler.pace,
    bowler.accuracy,
    bowler.swing,
    bowler.seam,
    bowler.spin,
    bowler.control,
    bowler.stamina,
  ];

  if (attributes.some(
    (value) => !Number.isFinite(value) || value < 0 || value > 100,
  )) {
    throw new Error("Bowler attributes must be between 0 and 100.");
  }

  if (!Number.isInteger(bowler.maxOvers) || bowler.maxOvers < 1) {
    throw new Error("Maximum overs must be a positive integer.");
  }
}

function getPitchMovementBonus(
  bowler: BowlerAttributes,
  conditions: BowlingConditions,
): number {
  switch (conditions.pitchType) {
    case "green":
      return bowler.seam * 0.22 + bowler.swing * 0.08;

    case "dry":
    case "dusty":
      return bowler.spin * 0.3;

    case "balanced":
      return bowler.seam * 0.08 + bowler.spin * 0.08;

    case "flat":
      return bowler.control * 0.04;
  }
}

function getWeatherBonus(
  bowler: BowlerAttributes,
  conditions: BowlingConditions,
): number {
  switch (conditions.weather) {
    case "cloudy":
      return bowler.swing * 0.15;

    case "humid":
      return bowler.swing * 0.1;

    case "rainy":
      return -5;

    case "sunny":
      return 0;
  }
}

function getVariationBonus(
  variation: BowlingVariation,
  bowler: BowlerAttributes,
): number {
  const bonuses: Record<BowlingVariation, number> = {
    stock: 0,
    yorker: bowler.accuracy * 0.08,
    bouncer: bowler.pace * 0.1,
    "slower-ball": bowler.control * 0.08,
    cutter: bowler.seam * 0.1,
    inswinger: bowler.swing * 0.12,
    outswinger: bowler.swing * 0.12,
    googly: bowler.spin * 0.12,
    doosra: bowler.spin * 0.1,
    flipper: bowler.spin * 0.1,
    "arm-ball": bowler.control * 0.08,
  };

  return bonuses[variation];
}

function getMovement(
  bowler: BowlerAttributes,
  variation: BowlingVariation,
  conditions: BowlingConditions,
): number {
  let movement =
    getPitchMovementBonus(bowler, conditions) +
    getWeatherBonus(bowler, conditions);

  if (
    variation === "inswinger" ||
    variation === "outswinger"
  ) {
    movement += bowler.swing * 0.2;
  }

  if (
    variation === "googly" ||
    variation === "doosra" ||
    variation === "flipper"
  ) {
    movement += bowler.spin * 0.2;
  }

  if (variation === "cutter") {
    movement += bowler.seam * 0.15;
  }

  return clamp(movement, 0, 100);
}

function getStaminaCost(
  delivery: BowlingDelivery,
): number {
  let cost = 1.2;

  if (delivery.power > 75) cost += 0.7;

  if (
    delivery.variation === "bouncer" ||
    delivery.variation === "yorker"
  ) {
    cost += 0.4;
  }

  if (delivery.variation === "slower-ball") {
    cost += 0.2;
  }

  return cost;
}

export function simulateBowlingDelivery(
  bowler: BowlerAttributes,
  delivery: BowlingDelivery,
  conditions: BowlingConditions,
): BowlingOutcome {
  validateAttributes(bowler);

  if (
    !Number.isFinite(delivery.power) ||
    delivery.power < 0 ||
    delivery.power > 100
  ) {
    throw new Error("Delivery power must be between 0 and 100.");
  }

  if (
    !Number.isFinite(conditions.dewFactor) ||
    conditions.dewFactor < 0 ||
    conditions.dewFactor > 100
  ) {
    throw new Error("Dew factor must be between 0 and 100.");
  }

  const fatiguePenalty = (100 - bowler.stamina) * 0.2;

  const pace = clamp(
    bowler.pace * (0.7 + delivery.power / 250) -
      fatiguePenalty,
    30,
    160,
  );

  const accuracy = clamp(
    bowler.accuracy +
      bowler.control * 0.15 -
      fatiguePenalty -
      Math.abs(delivery.power - 65) * 0.12,
    0,
    100,
  );

  const movement = getMovement(
    bowler,
    delivery.variation,
    conditions,
  );

  const variationBonus = getVariationBonus(
    delivery.variation,
    bowler,
  );

  const control = clamp(
    bowler.control -
      Math.max(0, delivery.power - 80) * 0.4 -
      fatiguePenalty,
    0,
    100,
  );

  const difficulty = clamp(
    accuracy * 0.3 +
      movement * 0.3 +
      variationBonus * 0.25 +
      control * 0.15,
    0,
    100,
  );

  const staminaCost = getStaminaCost(delivery);

  const effectiveness = clamp(
    difficulty -
      conditions.dewFactor * 0.12 +
      randomBetween(-4, 4),
    0,
    100,
  );

  let likelyOutcome: BowlingOutcome["likelyOutcome"];

  if (effectiveness >= 80) {
    likelyOutcome = "dot-ball";
  } else if (effectiveness >= 60) {
    likelyOutcome = "defensive";
  } else if (effectiveness >= 40) {
    likelyOutcome = "attacking";
  } else {
    likelyOutcome = "high-risk";
  }

  return {
    pace: Number(pace.toFixed(1)),
    accuracy: Number(accuracy.toFixed(1)),
    movement: Number(movement.toFixed(1)),
    control: Number(control.toFixed(1)),
    difficulty: Number(difficulty.toFixed(1)),
    staminaCost,
    effectiveness: Number(effectiveness.toFixed(1)),
    likelyOutcome,
  };
}

export function createBowlerMatchStats(
  bowler: BowlerAttributes,
): BowlerMatchStats {
  validateAttributes(bowler);

  return {
    playerId: bowler.playerId,
    ballsBowled: 0,
    runsConceded: 0,
    wickets: 0,
    wides: 0,
    noBalls: 0,
    currentSpellBalls: 0,
    staminaRemaining: bowler.stamina,
  };
}

export function updateBowlerAfterDelivery(
  stats: BowlerMatchStats,
  outcome: BowlingOutcome,
  runsConceded: number,
  isLegalDelivery: boolean,
  isWicket: boolean,
  isWide: boolean,
  isNoBall: boolean,
): BowlerMatchStats {
  if (!Number.isFinite(runsConceded) || runsConceded < 0) {
    throw new Error("Runs conceded must be a non-negative number.");
  }

  return {
    ...stats,
    ballsBowled:
      stats.ballsBowled + (isLegalDelivery ? 1 : 0),
    currentSpellBalls:
      stats.currentSpellBalls + (isLegalDelivery ? 1 : 0),
    runsConceded: stats.runsConceded + runsConceded,
    wickets: stats.wickets + (isWicket ? 1 : 0),
    wides: stats.wides + (isWide ? 1 : 0),
    noBalls: stats.noBalls + (isNoBall ? 1 : 0),
    staminaRemaining: clamp(
      stats.staminaRemaining - outcome.staminaCost,
      0,
      100,
    ),
  };
}

export function getBowlerEconomy(
  stats: BowlerMatchStats,
): number {
  if (stats.ballsBowled === 0) return 0;

  const overs = stats.ballsBowled / 6;

  return Number(
    (stats.runsConceded / overs).toFixed(2),
  );
}

export function getBowlerOvers(
  stats: BowlerMatchStats,
): string {
  return `${Math.floor(stats.ballsBowled / 6)}.${
    stats.ballsBowled % 6
  }`;
}

export function canBowlerContinue(
  bowler: BowlerAttributes,
  stats: BowlerMatchStats,
): boolean {
  return (
    stats.ballsBowled < bowler.maxOvers * 6 &&
    stats.staminaRemaining > 0
  );
}
