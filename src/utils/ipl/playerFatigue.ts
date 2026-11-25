
export type PlayerWorkloadType =
  | "batting"
  | "fast-bowling"
  | "spin-bowling"
  | "fielding"
  | "rest";

export interface PlayerFatigueState {
  playerId: string;
  stamina: number;
  fatigue: number;
  workload: number;
  recoveryRate: number;
  oversBowled: number;
  ballsFaced: number;
  minutesPlayed: number;
}

export interface FatigueConfig {
  battingCostPerBall: number;
  fastBowlingCostPerBall: number;
  spinBowlingCostPerBall: number;
  fieldingCostPerMinute: number;
  recoveryPerMinute: number;
  maximumFatigue: number;
}

export interface PlayerPerformanceModifiers {
  battingTiming: number;
  bowlingAccuracy: number;
  runningSpeed: number;
  fieldingReaction: number;
}

export const DEFAULT_FATIGUE_CONFIG: FatigueConfig = {
  battingCostPerBall: 0.035,
  fastBowlingCostPerBall: 0.12,
  spinBowlingCostPerBall: 0.065,
  fieldingCostPerMinute: 0.012,
  recoveryPerMinute: 0.08,
  maximumFatigue: 100,
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function validateState(state: PlayerFatigueState): void {
  const values = [
    state.stamina,
    state.fatigue,
    state.workload,
    state.recoveryRate,
    state.oversBowled,
    state.ballsFaced,
    state.minutesPlayed,
  ];

  if (
    values.some(
      (value) => !Number.isFinite(value) || value < 0,
    )
  ) {
    throw new Error("Player fatigue state contains invalid values.");
  }

  if (state.stamina > 100 || state.fatigue > 100) {
    throw new Error("Stamina and fatigue cannot exceed 100.");
  }
}

export function createPlayerFatigueState(
  playerId: string,
  initialStamina = 100,
): PlayerFatigueState {
  if (!playerId.trim()) {
    throw new Error("Player ID is required.");
  }

  if (
    !Number.isFinite(initialStamina) ||
    initialStamina < 0 ||
    initialStamina > 100
  ) {
    throw new Error("Initial stamina must be between 0 and 100.");
  }

  return {
    playerId,
    stamina: initialStamina,
    fatigue: 100 - initialStamina,
    workload: 0,
    recoveryRate: 1,
    oversBowled: 0,
    ballsFaced: 0,
    minutesPlayed: 0,
  };
}

export function applyPlayerWorkload(
  state: PlayerFatigueState,
  workloadType: PlayerWorkloadType,
  amount: number,
  config = DEFAULT_FATIGUE_CONFIG,
): PlayerFatigueState {
  validateState(state);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Workload amount must be non-negative.");
  }

  let fatigueIncrease = 0;
  let updatedOvers = state.oversBowled;
  let updatedBalls = state.ballsFaced;
  let updatedMinutes = state.minutesPlayed;

  switch (workloadType) {
    case "batting":
      fatigueIncrease = amount * config.battingCostPerBall;
      updatedBalls += amount;
      break;

    case "fast-bowling":
      fatigueIncrease = amount * config.fastBowlingCostPerBall;
      updatedOvers += amount / 6;
      break;

    case "spin-bowling":
      fatigueIncrease = amount * config.spinBowlingCostPerBall;
      updatedOvers += amount / 6;
      break;

    case "fielding":
      fatigueIncrease = amount * config.fieldingCostPerMinute;
      updatedMinutes += amount;
      break;

    case "rest":
      fatigueIncrease = -amount * config.recoveryPerMinute;
      break;
  }

  const fatigue = clamp(
    state.fatigue + fatigueIncrease,
    0,
    config.maximumFatigue,
  );

  return {
    ...state,
    fatigue,
    stamina: 100 - fatigue,
    workload: state.workload + Math.abs(amount),
    oversBowled: updatedOvers,
    ballsFaced: updatedBalls,
    minutesPlayed: updatedMinutes,
  };
}

export function recoverPlayer(
  state: PlayerFatigueState,
  minutes: number,
  config = DEFAULT_FATIGUE_CONFIG,
): PlayerFatigueState {
  validateState(state);

  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new Error("Recovery minutes must be non-negative.");
  }

  const recovery =
    minutes *
    config.recoveryPerMinute *
    state.recoveryRate;

  const fatigue = clamp(
    state.fatigue - recovery,
    0,
    config.maximumFatigue,
  );

  return {
    ...state,
    fatigue,
    stamina: 100 - fatigue,
  };
}

export function getPlayerPerformanceModifiers(
  state: PlayerFatigueState,
): PlayerPerformanceModifiers {
  validateState(state);

  const staminaFactor = state.stamina / 100;

  return {
    battingTiming: clamp(
      0.7 + staminaFactor * 0.3,
      0.7,
      1,
    ),
    bowlingAccuracy: clamp(
      0.65 + staminaFactor * 0.35,
      0.65,
      1,
    ),
    runningSpeed: clamp(
      0.6 + staminaFactor * 0.4,
      0.6,
      1,
    ),
    fieldingReaction: clamp(
      0.65 + staminaFactor * 0.35,
      0.65,
      1,
    ),
  };
}

export function getFatigueStatus(
  state: PlayerFatigueState,
): "fresh" | "normal" | "tired" | "exhausted" {
  validateState(state);

  if (state.fatigue < 20) return "fresh";
  if (state.fatigue < 45) return "normal";
  if (state.fatigue < 75) return "tired";

  return "exhausted";
}

export function resetPlayerMatchWorkload(
  state: PlayerFatigueState,
): PlayerFatigueState {
  validateState(state);

  return {
    ...state,
    workload: 0,
    oversBowled: 0,
    ballsFaced: 0,
    minutesPlayed: 0,
  };
}
