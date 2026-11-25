
export type DisciplineIncidentType =
  | "dissent"
  | "time-wasting"
  | "dangerous-play"
  | "unsporting-conduct"
  | "equipment-abuse"
  | "verbal-warning";

export type DisciplineSeverity =
  | "minor"
  | "moderate"
  | "serious";

export interface DisciplineIncident {
  incidentId: string;
  matchId: string;
  playerId: string;
  franchiseId: string;
  type: DisciplineIncidentType;
  severity: DisciplineSeverity;
  description: string;
  penaltyRuns: number;
  suspensionMatches: number;
  recordedAt: number;
}

export interface DisciplinePlayerRecord {
  playerId: string;
  warnings: number;
  incidents: number;
  penaltyRuns: number;
  suspensionMatches: number;
}

export interface DisciplineActionInput {
  matchId: string;
  playerId: string;
  franchiseId: string;
  type: DisciplineIncidentType;
  severity: DisciplineSeverity;
  description: string;
}

const SEVERITY_ACTIONS: Record<
  DisciplineSeverity,
  { penaltyRuns: number; suspensionMatches: number }
> = {
  minor: {
    penaltyRuns: 0,
    suspensionMatches: 0,
  },
  moderate: {
    penaltyRuns: 5,
    suspensionMatches: 0,
  },
  serious: {
    penaltyRuns: 5,
    suspensionMatches: 1,
  },
};

export function recordDisciplineIncident(
  input: DisciplineActionInput,
): DisciplineIncident {
  if (
    !input.matchId.trim() ||
    !input.playerId.trim() ||
    !input.franchiseId.trim()
  ) {
    throw new Error("Match, player, and franchise IDs are required.");
  }

  if (!input.description.trim()) {
    throw new Error("Incident description is required.");
  }

  const action = SEVERITY_ACTIONS[input.severity];

  if (!action) {
    throw new Error("Invalid discipline severity.");
  }

  return {
    incidentId: `incident-${input.matchId}-${Date.now()}-${input.playerId}`,
    matchId: input.matchId,
    playerId: input.playerId,
    franchiseId: input.franchiseId,
    type: input.type,
    severity: input.severity,
    description: input.description.trim(),
    penaltyRuns: action.penaltyRuns,
    suspensionMatches: action.suspensionMatches,
    recordedAt: Date.now(),
  };
}

export function calculatePlayerDisciplineRecord(
  incidents: DisciplineIncident[],
  playerId: string,
): DisciplinePlayerRecord {
  const playerIncidents = incidents.filter(
    (incident) => incident.playerId === playerId,
  );

  return {
    playerId,
    warnings: playerIncidents.filter(
      (incident) =>
        incident.type === "verbal-warning" ||
        incident.severity === "minor",
    ).length,
    incidents: playerIncidents.length,
    penaltyRuns: playerIncidents.reduce(
      (total, incident) => total + incident.penaltyRuns,
      0,
    ),
    suspensionMatches: playerIncidents.reduce(
      (total, incident) => total + incident.suspensionMatches,
      0,
    ),
  };
}

export function getFranchiseDisciplineIncidents(
  incidents: DisciplineIncident[],
  franchiseId: string,
): DisciplineIncident[] {
  return incidents.filter(
    (incident) => incident.franchiseId === franchiseId,
  );
}

export function getMatchDisciplineIncidents(
  incidents: DisciplineIncident[],
  matchId: string,
): DisciplineIncident[] {
  return incidents.filter(
    (incident) => incident.matchId === matchId,
  );
}

export function isPlayerSuspended(
  incidents: DisciplineIncident[],
  playerId: string,
): boolean {
  return incidents.some(
    (incident) =>
      incident.playerId === playerId &&
      incident.suspensionMatches > 0,
  );
}
