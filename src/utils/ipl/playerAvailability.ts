
export type InjurySeverity =
  | "minor"
  | "moderate"
  | "serious";

export type InjuryType =
  | "muscle-strain"
  | "ankle"
  | "knee"
  | "shoulder"
  | "back"
  | "finger"
  | "illness"
  | "other";

export type PlayerAvailabilityStatus =
  | "available"
  | "under-assessment"
  | "recovering"
  | "unavailable";

export interface PlayerInjury {
  id: string;
  playerId: string;
  type: InjuryType;
  severity: InjurySeverity;
  description: string;
  occurredAtMatchId: string | null;
  recoveryDaysRemaining: number;
  isResolved: boolean;
}

export interface PlayerAvailability {
  playerId: string;
  status: PlayerAvailabilityStatus;
  injuries: PlayerInjury[];
  matchesMissed: number;
  lastUpdated: number;
}

export interface InjuryConfig {
  minorRecoveryDays: number;
  moderateRecoveryDays: number;
  seriousRecoveryDays: number;
}

export const DEFAULT_INJURY_CONFIG: InjuryConfig = {
  minorRecoveryDays: 2,
  moderateRecoveryDays: 7,
  seriousRecoveryDays: 21,
};

function getRecoveryDays(
  severity: InjurySeverity,
  config: InjuryConfig,
): number {
  switch (severity) {
    case "minor":
      return config.minorRecoveryDays;

    case "moderate":
      return config.moderateRecoveryDays;

    case "serious":
      return config.seriousRecoveryDays;
  }
}

export function createPlayerAvailability(
  playerId: string,
): PlayerAvailability {
  if (!playerId.trim()) {
    throw new Error("Player ID is required.");
  }

  return {
    playerId,
    status: "available",
    injuries: [],
    matchesMissed: 0,
    lastUpdated: Date.now(),
  };
}

export function reportPlayerInjury(
  availability: PlayerAvailability,
  type: InjuryType,
  severity: InjurySeverity,
  matchId: string | null = null,
  config = DEFAULT_INJURY_CONFIG,
): PlayerAvailability {
  const recoveryDays = getRecoveryDays(severity, config);

  const injury: PlayerInjury = {
    id: `${availability.playerId}-${Date.now()}`,
    playerId: availability.playerId,
    type,
    severity,
    description: `${severity} ${type} injury`,
    occurredAtMatchId: matchId,
    recoveryDaysRemaining: recoveryDays,
    isResolved: false,
  };

  const injuries = [...availability.injuries, injury];

  return {
    ...availability,
    status:
      severity === "serious"
        ? "unavailable"
        : "recovering",
    injuries,
    lastUpdated: Date.now(),
  };
}

export function advanceInjuryRecovery(
  availability: PlayerAvailability,
  days = 1,
): PlayerAvailability {
  if (!Number.isInteger(days) || days < 0) {
    throw new Error("Recovery days must be a non-negative integer.");
  }

  const injuries = availability.injuries.map((injury) => {
    if (injury.isResolved) return injury;

    const remaining = Math.max(
      0,
      injury.recoveryDaysRemaining - days,
    );

    return {
      ...injury,
      recoveryDaysRemaining: remaining,
      isResolved: remaining === 0,
    };
  });

  const hasActiveInjury = injuries.some(
    (injury) => !injury.isResolved,
  );

  return {
    ...availability,
    injuries,
    status: hasActiveInjury ? "recovering" : "available",
    lastUpdated: Date.now(),
  };
}

export function recordMissedMatch(
  availability: PlayerAvailability,
): PlayerAvailability {
  return {
    ...availability,
    matchesMissed: availability.matchesMissed + 1,
    lastUpdated: Date.now(),
  };
}

export function isPlayerAvailable(
  availability: PlayerAvailability,
): boolean {
  return (
    availability.status === "available" &&
    availability.injuries.every((injury) => injury.isResolved)
  );
}

export function getActiveInjuries(
  availability: PlayerAvailability,
): PlayerInjury[] {
  return availability.injuries.filter(
    (injury) => !injury.isResolved,
  );
}

export function setPlayerUnderAssessment(
  availability: PlayerAvailability,
): PlayerAvailability {
  if (availability.status === "unavailable") {
    return availability;
  }

  return {
    ...availability,
    status: "under-assessment",
    lastUpdated: Date.now(),
  };
}

export function clearResolvedInjuries(
  availability: PlayerAvailability,
): PlayerAvailability {
  return {
    ...availability,
    injuries: availability.injuries.filter(
      (injury) => !injury.isResolved,
    ),
    status:
      availability.injuries.some((injury) => !injury.isResolved)
        ? "recovering"
        : "available",
    lastUpdated: Date.now(),
  };
}
