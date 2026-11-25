
export type InjurySeverity = "minor" | "moderate" | "major";

export type RecoveryStatus =
  | "unavailable"
  | "recovering"
  | "fitness-test"
  | "available";

export type InjuryType =
  | "muscle-strain"
  | "joint-injury"
  | "impact-injury"
  | "fatigue-related"
  | "other";

export interface PlayerInjury {
  injuryId: string;
  playerId: string;
  type: InjuryType;
  severity: InjurySeverity;
  recoveryDaysRemaining: number;
  recoveryProgress: number;
  status: RecoveryStatus;
  reportedAt: number;
}

export interface RecoveryUpdate {
  injury: PlayerInjury;
  daysAdvanced: number;
  progressGained: number;
  becameAvailable: boolean;
}

const BASE_RECOVERY_DAYS: Record<InjurySeverity, number> = {
  minor: 3,
  moderate: 14,
  major: 45,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function validateDays(days: number): void {
  if (!Number.isInteger(days) || days < 0 || days > 365) {
    throw new Error("Days must be a whole number between 0 and 365.");
  }
}

export function createPlayerInjury(
  playerId: string,
  type: InjuryType,
  severity: InjurySeverity,
  recoveryDaysOverride?: number,
): PlayerInjury {
  if (!playerId.trim()) {
    throw new Error("Player ID is required.");
  }

  const recoveryDays =
    recoveryDaysOverride ?? BASE_RECOVERY_DAYS[severity];

  if (!Number.isInteger(recoveryDays) || recoveryDays < 1 || recoveryDays > 365) {
    throw new Error("Recovery duration must be between 1 and 365 days.");
  }

  return {
    injuryId: `injury-${playerId}-${Date.now()}`,
    playerId,
    type,
    severity,
    recoveryDaysRemaining: recoveryDays,
    recoveryProgress: 0,
    status: "unavailable",
    reportedAt: Date.now(),
  };
}

export function advanceRecovery(
  injury: PlayerInjury,
  days: number,
): RecoveryUpdate {
  validateDays(days);

  if (injury.status === "available") {
    return {
      injury,
      daysAdvanced: 0,
      progressGained: 0,
      becameAvailable: false,
    };
  }

  const daysAdvanced = Math.min(
    days,
    injury.recoveryDaysRemaining,
  );

  const remaining = Math.max(
    0,
    injury.recoveryDaysRemaining - daysAdvanced,
  );

  const progressGained =
    injury.recoveryDaysRemaining > 0
      ? (daysAdvanced / injury.recoveryDaysRemaining) * 100
      : 0;

  const recoveryProgress = clamp(
    injury.recoveryProgress + progressGained,
  );

  const status: RecoveryStatus =
    remaining > 0
      ? "recovering"
      : "fitness-test";

  const updatedInjury: PlayerInjury = {
    ...injury,
    recoveryDaysRemaining: remaining,
    recoveryProgress,
    status,
  };

  return {
    injury: updatedInjury,
    daysAdvanced,
    progressGained,
    becameAvailable: false,
  };
}

export function completeFitnessTest(
  injury: PlayerInjury,
  passed: boolean,
): PlayerInjury {
  if (injury.status !== "fitness-test") {
    throw new Error("Player is not ready for a fitness test.");
  }

  if (!passed) {
    return {
      ...injury,
      status: "recovering",
      recoveryDaysRemaining: 3,
      recoveryProgress: 90,
    };
  }

  return {
    ...injury,
    status: "available",
    recoveryProgress: 100,
  };
}

export function calculateRecoveryProgress(
  injury: PlayerInjury,
): number {
  return clamp(injury.recoveryProgress);
}

export function getUnavailablePlayers(
  injuries: PlayerInjury[],
): string[] {
  return [
    ...new Set(
      injuries
        .filter((injury) => injury.status !== "available")
        .map((injury) => injury.playerId),
    ),
  ];
}

export function getInjuriesBySeverity(
  injuries: PlayerInjury[],
  severity: InjurySeverity,
): PlayerInjury[] {
  return injuries.filter(
    (injury) =>
      injury.severity === severity &&
      injury.status !== "available",
  );
}
