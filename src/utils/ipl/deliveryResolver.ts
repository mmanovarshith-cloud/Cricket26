
import type {
  BatterAttributes,
  BattingInput,
  BattingConditions,
  BowlingChallenge,
  BattingOutcome,
} from "./battingEngine";

import { simulateBattingShot } from "./battingEngine";

import type {
  BallLaunchInput,
  BallState,
} from "./ballPhysics";

import {
  createBallState,
  simulateBallFlight,
} from "./ballPhysics";

export type DeliveryResultType =
  | "dot"
  | "runs"
  | "boundary"
  | "six"
  | "wicket";

export interface DeliveryResolutionInput {
  batter: BatterAttributes;
  batting: BattingInput;
  bowling: BowlingChallenge;
  conditions: BattingConditions;
  launch: Omit<BallLaunchInput, "spin">;
  spin: { x: number; y: number; z: number };
  randomValue: number;
}

export interface DeliveryResolution {
  result: DeliveryResultType;
  runs: number;
  isWicket: boolean;
  battingOutcome: BattingOutcome;
  ballTrajectory: BallState[];
  finalBallPosition: {
    x: number;
    y: number;
    z: number;
  };
}

function validateRandomValue(value: number): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value >= 1
  ) {
    throw new Error("Random value must be between 0 and 1.");
  }
}

function classifyResult(
  runs: number,
  isWicket: boolean,
): DeliveryResultType {
  if (isWicket) {
    return "wicket";
  }

  if (runs === 6) {
    return "six";
  }

  if (runs === 4) {
    return "boundary";
  }

  if (runs === 0) {
    return "dot";
  }

  return "runs";
}

export function resolveDelivery(
  input: DeliveryResolutionInput,
): DeliveryResolution {
  validateRandomValue(input.randomValue);

  const battingOutcome = simulateBattingShot(
    input.batter,
    input.batting,
    input.bowling,
    input.conditions,
  );

  const isWicket =
    input.randomValue * 100 <
    battingOutcome.wicketChance;

  const boundaryRoll = (input.randomValue * 100 + 37.5) % 100;

  let runs = 0;

  if (!isWicket) {
    if (
      battingOutcome.likelyRuns === 6 &&
      boundaryRoll < battingOutcome.boundaryChance
    ) {
      runs = 6;
    } else if (
      battingOutcome.likelyRuns >= 4 &&
      boundaryRoll < battingOutcome.boundaryChance
    ) {
      runs = 4;
    } else if (battingOutcome.executionScore >= 45) {
      runs = battingOutcome.likelyRuns >= 2 ? 2 : 1;
    }
  }

  const launch: BallLaunchInput = {
    ...input.launch,
    spin: input.spin,
  };

  const initialBall = createBallState(launch);

  const flightDuration = runs === 6 ? 5 : runs === 4 ? 3.5 : 2;

  const ballTrajectory = simulateBallFlight(
    initialBall,
    flightDuration,
  );

  const finalBallPosition =
    ballTrajectory[ballTrajectory.length - 1].position;

  return {
    result: classifyResult(runs, isWicket),
    runs,
    isWicket,
    battingOutcome,
    ballTrajectory,
    finalBallPosition,
  };
}

export function getDeliverySummary(
  resolution: DeliveryResolution,
): string {
  if (resolution.isWicket) {
    return "WICKET! The batter has been dismissed.";
  }

  switch (resolution.result) {
    case "six":
      return "SIX! The ball clears the boundary.";
    case "boundary":
      return "FOUR! The ball reaches the boundary.";
    case "dot":
      return "Dot ball. No runs scored.";
    case "runs":
      return `${resolution.runs} run(s) scored.`;
    case "wicket":
      return "Wicket.";
  }
}
