
export type FieldingPosition =
  | "slip"
  | "gully"
  | "point"
  | "cover"
  | "extra-cover"
  | "mid-off"
  | "mid-on"
  | "midwicket"
  | "square-leg"
  | "fine-leg"
  | "third-man"
  | "long-off"
  | "long-on"
  | "deep-cover"
  | "deep-square-leg"
  | "wicketkeeper";

export type FieldingAction =
  | "ground-stop"
  | "diving-stop"
  | "catch"
  | "boundary-save"
  | "direct-hit"
  | "throw-to-wicket";

export interface FielderAttributes {
  playerId: string;
  name: string;
  fielding: number;
  catching: number;
  throwing: number;
  reaction: number;
  speed: number;
  agility: number;
  stamina: number;
}

export interface FieldingSituation {
  position: FieldingPosition;
  fielderPosition: {
    x: number;
    z: number;
  };
  ballPosition: {
    x: number;
    z: number;
  };
  ballHeight: number;
  ballSpeed: number;
  timeAvailable: number;
  pressure: number;
  isBoundaryNearby: boolean;
}

export interface FieldingEvaluation {
  action: FieldingAction;
  distanceToBall: number;
  reactionTime: number;
  movementTime: number;
  interceptionScore: number;
  executionScore: number;
  catchChance: number;
  misfieldChance: number;
  boundarySaveChance: number;
  throwAccuracy: number;
  recommendedAction: FieldingAction;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

function validateAttributes(fielder: FielderAttributes): void {
  const values = [
    fielder.fielding,
    fielder.catching,
    fielder.throwing,
    fielder.reaction,
    fielder.speed,
    fielder.agility,
    fielder.stamina,
  ];

  if (
    values.some(
      (value) =>
        !Number.isFinite(value) || value < 0 || value > 100,
    )
  ) {
    throw new Error("Fielder attributes must be between 0 and 100.");
  }
}

function validateSituation(situation: FieldingSituation): void {
  const values = [
    situation.fielderPosition.x,
    situation.fielderPosition.z,
    situation.ballPosition.x,
    situation.ballPosition.z,
    situation.ballHeight,
    situation.ballSpeed,
    situation.timeAvailable,
    situation.pressure,
  ];

  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("Fielding situation contains invalid values.");
  }

  if (
    situation.ballHeight < 0 ||
    situation.ballSpeed < 0 ||
    situation.timeAvailable < 0 ||
    situation.pressure < 0 ||
    situation.pressure > 100
  ) {
    throw new Error("Invalid fielding situation values.");
  }
}

function getDistance(
  first: { x: number; z: number },
  second: { x: number; z: number },
): number {
  return Math.hypot(
    second.x - first.x,
    second.z - first.z,
  );
}

function getReactionTime(fielder: FielderAttributes): number {
  return 0.45 - fielder.reaction * 0.0025;
}

function getMovementSpeed(fielder: FielderAttributes): number {
  const baseSpeed = 3.5;

  return (
    baseSpeed +
    fielder.speed * 0.045 +
    fielder.agility * 0.012
  ) * (0.7 + fielder.stamina * 0.003);
}

function getPositionDifficulty(
  position: FieldingPosition,
  ballHeight: number,
): number {
  if (position === "wicketkeeper") {
    return ballHeight > 1.8 ? 18 : 5;
  }

  if (
    position === "slip" ||
    position === "gully" ||
    position === "third-man"
  ) {
    return ballHeight > 1.5 ? 12 : 4;
  }

  if (
    position === "long-off" ||
    position === "long-on" ||
    position === "deep-cover" ||
    position === "deep-square-leg"
  ) {
    return ballHeight > 2 ? 8 : 5;
  }

  return ballHeight > 2 ? 15 : 3;
}

export function evaluateFieldingAction(
  fielder: FielderAttributes,
  situation: FieldingSituation,
  action: FieldingAction,
): FieldingEvaluation {
  validateAttributes(fielder);
  validateSituation(situation);

  const distanceToBall = getDistance(
    situation.fielderPosition,
    situation.ballPosition,
  );

  const reactionTime = getReactionTime(fielder);

  const movementTime =
    distanceToBall / getMovementSpeed(fielder);

  const availableMovementTime = Math.max(
    0,
    situation.timeAvailable - reactionTime,
  );

  const interceptionScore = clamp(
    100 -
      Math.max(0, movementTime - availableMovementTime) * 55 -
      distanceToBall * 1.5,
    0,
    100,
  );

  const positionDifficulty = getPositionDifficulty(
    situation.position,
    situation.ballHeight,
  );

  const staminaPenalty = (100 - fielder.stamina) * 0.12;
  const pressurePenalty = situation.pressure * 0.12;

  const executionScore = clamp(
    fielder.fielding * 0.3 +
      fielder.agility * 0.15 +
      fielder.reaction * 0.15 +
      interceptionScore * 0.4 -
      staminaPenalty -
      pressurePenalty -
      positionDifficulty,
    0,
    100,
  );

  const catchChance = clamp(
    fielder.catching * 0.45 +
      executionScore * 0.4 +
      fielder.reaction * 0.15 -
      positionDifficulty * 0.3,
    0,
    99,
  );

  const misfieldChance = clamp(
    100 - executionScore + pressurePenalty,
    1,
    95,
  );

  const boundarySaveChance = clamp(
    fielder.speed * 0.25 +
      fielder.agility * 0.2 +
      fielder.fielding * 0.3 +
      interceptionScore * 0.25 -
      distanceToBall * 2,
    0,
    99,
  );

  const throwAccuracy = clamp(
    fielder.throwing * 0.65 +
      fielder.fielding * 0.15 +
      fielder.agility * 0.1 +
      executionScore * 0.1 -
      distanceToBall * 0.4,
    0,
    100,
  );

  let recommendedAction: FieldingAction = "ground-stop";

  if (situation.ballHeight > 0.8) {
    recommendedAction = "catch";
  } else if (situation.isBoundaryNearby) {
    recommendedAction = "boundary-save";
  } else if (distanceToBall > 3) {
    recommendedAction = "diving-stop";
  }

  return {
    action,
    distanceToBall: Number(distanceToBall.toFixed(2)),
    reactionTime: Number(reactionTime.toFixed(3)),
    movementTime: Number(movementTime.toFixed(3)),
    interceptionScore: Number(interceptionScore.toFixed(1)),
    executionScore: Number(executionScore.toFixed(1)),
    catchChance: Number(catchChance.toFixed(1)),
    misfieldChance: Number(misfieldChance.toFixed(1)),
    boundarySaveChance: Number(boundarySaveChance.toFixed(1)),
    throwAccuracy: Number(throwAccuracy.toFixed(1)),
    recommendedAction,
  };
}

export function calculateCatchSuccess(
  fielder: FielderAttributes,
  situation: FieldingSituation,
  randomValue: number,
): boolean {
  if (
    !Number.isFinite(randomValue) ||
    randomValue < 0 ||
    randomValue >= 1
  ) {
    throw new Error("Random value must be between 0 and 1.");
  }

  const evaluation = evaluateFieldingAction(
    fielder,
    situation,
    "catch",
  );

  return randomValue * 100 < evaluation.catchChance;
}

export function calculateRunOutChance(
  fielder: FielderAttributes,
  situation: FieldingSituation,
  randomValue: number,
): boolean {
  if (
    !Number.isFinite(randomValue) ||
    randomValue < 0 ||
    randomValue >= 1
  ) {
    throw new Error("Random value must be between 0 and 1.");
  }

  const evaluation = evaluateFieldingAction(
    fielder,
    situation,
    "throw-to-wicket",
  );

  const runOutChance = clamp(
    evaluation.throwAccuracy * 0.65 +
      evaluation.interceptionScore * 0.2 +
      fielder.reaction * 0.15 -
      situation.pressure * 0.1,
    0,
    95,
  );

  return randomValue * 100 < runOutChance;
}

export function getFielderRating(
  fielder: FielderAttributes,
): number {
  validateAttributes(fielder);

  return Math.round(
    fielder.fielding * 0.25 +
      fielder.catching * 0.2 +
      fielder.throwing * 0.15 +
      fielder.reaction * 0.15 +
      fielder.speed * 0.1 +
      fielder.agility * 0.1 +
      fielder.stamina * 0.05,
  );
}
