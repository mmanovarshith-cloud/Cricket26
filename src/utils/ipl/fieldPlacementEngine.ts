
import type { FieldingPosition } from "./fieldingEngine";

export type MatchPhase = "powerplay" | "middle" | "death";

export type BowlingStrategy =
  | "attacking"
  | "defensive"
  | "containment"
  | "wicket-taking"
  | "boundary-protection";

export type BatterHand = "right" | "left";

export type BowlingPlan =
  | "pace"
  | "swing"
  | "seam"
  | "off-spin"
  | "leg-spin"
  | "variation";

export interface FieldCoordinate {
  x: number;
  z: number;
}

export interface FieldPlacement {
  position: FieldingPosition;
  coordinate: FieldCoordinate;
  isBoundaryFielder: boolean;
}

export interface FieldPlacementInput {
  phase: MatchPhase;
  strategy: BowlingStrategy;
  bowlingPlan: BowlingPlan;
  batterHand: BatterHand;
  batterAggression: number;
  requiredRunRate: number;
  wicketsRemaining: number;
}

export interface FieldFormation {
  name: string;
  description: string;
  placements: FieldPlacement[];
  boundaryFielderCount: number;
  strategy: BowlingStrategy;
  phase: MatchPhase;
}

const FIELD_RADIUS = 75;
const INNER_CIRCLE_RADIUS = 27.4;

const POSITION_COORDINATES: Record<
  FieldingPosition,
  FieldCoordinate
> = {
  slip: { x: -8, z: 12 },
  gully: { x: -20, z: 17 },
  point: { x: -25, z: 0 },
  cover: { x: -22, z: -17 },
  "extra-cover": { x: -12, z: -24 },
  "mid-off": { x: -5, z: -28 },
  "mid-on": { x: 5, z: -28 },
  midwicket: { x: 22, z: -17 },
  "square-leg": { x: 25, z: 0 },
  "fine-leg": { x: 15, z: 25 },
  "third-man": { x: -18, z: 28 },
  "long-off": { x: -8, z: -65 },
  "long-on": { x: 8, z: -65 },
  "deep-cover": { x: -48, z: -42 },
  "deep-square-leg": { x: 52, z: 5 },
  wicketkeeper: { x: 0, z: 12 },
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function validateInput(input: FieldPlacementInput): void {
  if (
    !Number.isFinite(input.batterAggression) ||
    input.batterAggression < 0 ||
    input.batterAggression > 100
  ) {
    throw new Error("Batter aggression must be between 0 and 100.");
  }

  if (
    !Number.isFinite(input.requiredRunRate) ||
    input.requiredRunRate < 0 ||
    input.requiredRunRate > 50
  ) {
    throw new Error("Invalid required run rate.");
  }

  if (
    !Number.isInteger(input.wicketsRemaining) ||
    input.wicketsRemaining < 0 ||
    input.wicketsRemaining > 10
  ) {
    throw new Error("Wickets remaining must be between 0 and 10.");
  }
}

function mirrorForLeftHander(
  coordinate: FieldCoordinate,
  batterHand: BatterHand,
): FieldCoordinate {
  if (batterHand === "right") {
    return { ...coordinate };
  }

  return {
    x: -coordinate.x,
    z: coordinate.z,
  };
}

function isOutsideInnerCircle(
  coordinate: FieldCoordinate,
): boolean {
  return Math.hypot(coordinate.x, coordinate.z) >
    INNER_CIRCLE_RADIUS;
}

function getBoundaryLimit(phase: MatchPhase): number {
  return phase === "powerplay" ? 2 : 5;
}

function getFormationName(
  strategy: BowlingStrategy,
  phase: MatchPhase,
): string {
  const names: Record<BowlingStrategy, string> = {
    attacking: "Attacking Field",
    defensive: "Defensive Field",
    containment: "Run Containment",
    "wicket-taking": "Wicket-Taking Field",
    "boundary-protection": "Boundary Protection",
  };

  return `${names[strategy]} — ${phase.toUpperCase()}`;
}

function selectPositions(
  input: FieldPlacementInput,
): FieldingPosition[] {
  const positions: FieldingPosition[] = [
    "wicketkeeper",
  ];

  if (
    input.strategy === "attacking" ||
    input.strategy === "wicket-taking"
  ) {
    positions.push(
      "slip",
      "gully",
      "point",
      "cover",
      "mid-off",
      "mid-on",
      "midwicket",
      "fine-leg",
      "third-man",
    );

    if (input.bowlingPlan === "pace" ||
        input.bowlingPlan === "swing" ||
        input.bowlingPlan === "seam") {
      return positions;
    }

    return positions;
  }

  if (input.strategy === "boundary-protection") {
    positions.push(
      "deep-cover",
      "long-off",
      "long-on",
      "deep-square-leg",
      "fine-leg",
      "point",
      "cover",
      "midwicket",
      "third-man",
    );

    return positions;
  }

  if (input.strategy === "containment") {
    positions.push(
      "point",
      "cover",
      "extra-cover",
      "mid-off",
      "mid-on",
      "midwicket",
      "square-leg",
      "fine-leg",
      "third-man",
    );

    return positions;
  }

  positions.push(
    "point",
    "cover",
    "mid-off",
    "mid-on",
    "midwicket",
    "square-leg",
    "fine-leg",
    "third-man",
    "long-on",
  );

  return positions;
}

function adjustForBowlingPlan(
  positions: FieldingPosition[],
  plan: BowlingPlan,
): FieldingPosition[] {
  const adjusted = [...positions];

  if (plan === "off-spin") {
    replacePosition(adjusted, "fine-leg", "slip");
  } else if (plan === "leg-spin") {
    replacePosition(adjusted, "third-man", "slip");
  } else if (plan === "swing" || plan === "seam") {
    replacePosition(adjusted, "deep-square-leg", "gully");
  }

  return adjusted;
}

function replacePosition(
  positions: FieldingPosition[],
  oldPosition: FieldingPosition,
  newPosition: FieldingPosition,
): void {
  const index = positions.indexOf(oldPosition);

  if (index !== -1 && !positions.includes(newPosition)) {
    positions[index] = newPosition;
  }
}

function enforceBoundaryLimit(
  placements: FieldPlacement[],
  phase: MatchPhase,
): FieldPlacement[] {
  const limit = getBoundaryLimit(phase);

  const outside = placements.filter(
    (placement) =>
      placement.position !== "wicketkeeper" &&
      isOutsideInnerCircle(placement.coordinate),
  );

  if (outside.length <= limit) {
    return placements;
  }

  const outsideIds = new Set(
    outside
      .slice(limit)
      .map((placement) => placement.position),
  );

  return placements.map((placement) => {
    if (!outsideIds.has(placement.position)) {
      return placement;
    }

    const original = POSITION_COORDINATES[placement.position];

    const scale =
      INNER_CIRCLE_RADIUS /
      Math.max(1, Math.hypot(original.x, original.z));

    return {
      ...placement,
      coordinate: {
        x: original.x * scale * 0.9,
        z: original.z * scale * 0.9,
      },
      isBoundaryFielder: false,
    };
  });
}

export function createFieldFormation(
  input: FieldPlacementInput,
): FieldFormation {
  validateInput(input);

  let positions = selectPositions(input);

  positions = adjustForBowlingPlan(
    positions,
    input.bowlingPlan,
  );

  const uniquePositions = [...new Set(positions)].slice(0, 10);

  let placements: FieldPlacement[] = uniquePositions.map(
    (position) => {
      const coordinate = mirrorForLeftHander(
        POSITION_COORDINATES[position],
        input.batterHand,
      );

      return {
        position,
        coordinate,
        isBoundaryFielder:
          position !== "wicketkeeper" &&
          isOutsideInnerCircle(coordinate),
      };
    },
  );

  placements = enforceBoundaryLimit(
    placements,
    input.phase,
  );

  const boundaryFielderCount = placements.filter(
    (placement) => placement.isBoundaryFielder,
  ).length;

  return {
    name: getFormationName(input.strategy, input.phase),
    description:
      `A ${input.strategy} formation for the ${input.phase} phase, ` +
      `adjusted for ${input.bowlingPlan} bowling against a ` +
      `${input.batterHand}-handed batter.`,
    placements,
    boundaryFielderCount,
    strategy: input.strategy,
    phase: input.phase,
  };
}

export function recommendFieldStrategy(
  input: Omit<FieldPlacementInput, "strategy">,
): BowlingStrategy {
  validateInput({
    ...input,
    strategy: "attacking",
  });

  if (
    input.wicketsRemaining <= 3 &&
    input.phase !== "death"
  ) {
    return "wicket-taking";
  }

  if (
    input.phase === "powerplay" &&
    input.batterAggression < 65
  ) {
    return "attacking";
  }

  if (
    input.phase === "death" ||
    input.requiredRunRate >= 10 ||
    input.batterAggression >= 80
  ) {
    return "boundary-protection";
  }

  if (
    input.requiredRunRate >= 8 ||
    input.batterAggression >= 60
  ) {
    return "containment";
  }

  return "defensive";
}

export function getFieldingPositionCoordinate(
  position: FieldingPosition,
  batterHand: BatterHand,
): FieldCoordinate {
  return mirrorForLeftHander(
    POSITION_COORDINATES[position],
    batterHand,
  );
}

export function getFieldBoundaryDistance(
  coordinate: FieldCoordinate,
): number {
  return Number(
    Math.max(
      0,
      FIELD_RADIUS - Math.hypot(coordinate.x, coordinate.z),
    ).toFixed(2),
  );
}
