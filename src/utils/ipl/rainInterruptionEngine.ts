
export type InterruptionStatus =
  | "scheduled"
  | "delayed"
  | "reduced-overs"
  | "resumed"
  | "abandoned"
  | "completed";

export interface RainInterruption {
  interruptionId: string;
  matchId: string;
  startOver: number;
  delayMinutes: number;
  oversLost: number;
  status: InterruptionStatus;
  reason: string;
  recordedAt: number;
}

export interface RainMatchState {
  matchId: string;
  scheduledOvers: number;
  currentOvers: number;
  oversCompleted: number;
  status: InterruptionStatus;
  interruptions: RainInterruption[];
}

export interface RainInterruptionInput {
  matchId: string;
  scheduledOvers: number;
  oversCompleted: number;
  delayMinutes: number;
  reason: string;
}

function validateOvers(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 50) {
    throw new Error(`${name} must be a whole number between 0 and 50.`);
  }
}

export function createRainMatchState(
  matchId: string,
  scheduledOvers = 20,
): RainMatchState {
  if (!matchId.trim()) {
    throw new Error("Match ID is required.");
  }

  validateOvers(scheduledOvers, "Scheduled overs");

  if (scheduledOvers === 0) {
    throw new Error("A match must have at least one scheduled over.");
  }

  return {
    matchId,
    scheduledOvers,
    currentOvers: scheduledOvers,
    oversCompleted: 0,
    status: "scheduled",
    interruptions: [],
  };
}

export function recordRainInterruption(
  input: RainInterruptionInput,
): RainInterruption {
  if (!input.matchId.trim()) {
    throw new Error("Match ID is required.");
  }

  validateOvers(input.scheduledOvers, "Scheduled overs");
  validateOvers(input.oversCompleted, "Overs completed");

  if (input.scheduledOvers === 0) {
    throw new Error("Scheduled overs must be greater than zero.");
  }

  if (input.oversCompleted > input.scheduledOvers) {
    throw new Error("Completed overs cannot exceed scheduled overs.");
  }

  if (
    !Number.isFinite(input.delayMinutes) ||
    input.delayMinutes < 0
  ) {
    throw new Error("Delay minutes cannot be negative.");
  }

  if (!input.reason.trim()) {
    throw new Error("An interruption reason is required.");
  }

  return {
    interruptionId: `rain-${input.matchId}-${Date.now()}`,
    matchId: input.matchId,
    startOver: input.oversCompleted,
    delayMinutes: input.delayMinutes,
    oversLost: 0,
    status: "delayed",
    reason: input.reason.trim(),
    recordedAt: Date.now(),
  };
}

export function calculateReducedOvers(
  scheduledOvers: number,
  oversLost: number,
): number {
  validateOvers(scheduledOvers, "Scheduled overs");
  validateOvers(oversLost, "Overs lost");

  return Math.max(0, scheduledOvers - oversLost);
}

export function applyOversReduction(
  state: RainMatchState,
  oversLost: number,
): RainMatchState {
  validateOvers(oversLost, "Overs lost");

  if (
    state.status === "abandoned" ||
    state.status === "completed"
  ) {
    throw new Error("Cannot reduce overs after the match has ended.");
  }

  const newTotal = calculateReducedOvers(
    state.currentOvers,
    oversLost,
  );

  if (newTotal < state.oversCompleted) {
    throw new Error("New innings limit cannot be below overs completed.");
  }

  const updatedInterruption = state.interruptions.map(
    (interruption, index) =>
      index === state.interruptions.length - 1
        ? {
            ...interruption,
            oversLost,
            status: "reduced-overs" as const,
          }
        : interruption,
  );

  return {
    ...state,
    currentOvers: newTotal,
    status: "reduced-overs",
    interruptions: updatedInterruption,
  };
}

export function resumeRainDelayedMatch(
  state: RainMatchState,
): RainMatchState {
  if (
    state.status !== "delayed" &&
    state.status !== "reduced-overs"
  ) {
    throw new Error("Match is not waiting to resume.");
  }

  if (state.currentOvers <= state.oversCompleted) {
    throw new Error("No overs remain; the match cannot resume.");
  }

  return {
    ...state,
    status: "resumed",
  };
}

export function abandonRainDelayedMatch(
  state: RainMatchState,
): RainMatchState {
  if (state.status === "completed") {
    throw new Error("A completed match cannot be abandoned.");
  }

  return {
    ...state,
    status: "abandoned",
  };
}

export function getRemainingOvers(
  state: RainMatchState,
): number {
  return Math.max(0, state.currentOvers - state.oversCompleted);
}
