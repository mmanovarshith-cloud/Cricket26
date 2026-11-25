
export type MoraleLevel =
  | "excellent"
  | "good"
  | "neutral"
  | "low"
  | "poor";

export type ChemistryEvent =
  | "match-win"
  | "match-loss"
  | "winning-streak"
  | "losing-streak"
  | "captain-support"
  | "dropped-from-xi"
  | "selected-for-xi"
  | "team-milestone"
  | "internal-conflict"
  | "team-meeting";

export interface PlayerMorale {
  playerId: string;
  morale: number;
  confidence: number;
  happiness: number;
  leadership: number;
  lastUpdated: number;
}

export interface TeamChemistry {
  franchiseId: string;
  chemistry: number;
  unity: number;
  communication: number;
  leadershipTrust: number;
  morale: number;
  lastUpdated: number;
}

export interface ChemistryEventResult {
  playerMorale: PlayerMorale;
  teamChemistry: TeamChemistry;
  event: ChemistryEvent;
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function validateScore(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${name} must be between 0 and 100.`);
  }
}

export function createPlayerMorale(
  playerId: string,
  initialMorale = 70,
): PlayerMorale {
  if (!playerId.trim()) {
    throw new Error("Player ID is required.");
  }

  validateScore(initialMorale, "Initial morale");

  return {
    playerId,
    morale: initialMorale,
    confidence: initialMorale,
    happiness: initialMorale,
    leadership: 50,
    lastUpdated: Date.now(),
  };
}

export function createTeamChemistry(
  franchiseId: string,
  initialChemistry = 70,
): TeamChemistry {
  if (!franchiseId.trim()) {
    throw new Error("Franchise ID is required.");
  }

  validateScore(initialChemistry, "Initial chemistry");

  return {
    franchiseId,
    chemistry: initialChemistry,
    unity: initialChemistry,
    communication: initialChemistry,
    leadershipTrust: initialChemistry,
    morale: initialChemistry,
    lastUpdated: Date.now(),
  };
}

const PLAYER_EVENT_EFFECTS: Record<
  ChemistryEvent,
  Partial<Record<keyof PlayerMorale, number>>
> = {
  "match-win": { morale: 4, confidence: 5, happiness: 4 },
  "match-loss": { morale: -4, confidence: -3, happiness: -4 },
  "winning-streak": { morale: 7, confidence: 8, happiness: 6 },
  "losing-streak": { morale: -7, confidence: -8, happiness: -6 },
  "captain-support": { morale: 5, confidence: 6, happiness: 5 },
  "dropped-from-xi": { morale: -8, confidence: -7, happiness: -9 },
  "selected-for-xi": { morale: 6, confidence: 5, happiness: 7 },
  "team-milestone": { morale: 4, confidence: 4, happiness: 5 },
  "internal-conflict": { morale: -8, confidence: -4, happiness: -10 },
  "team-meeting": { morale: 3, confidence: 2, happiness: 3 },
};

const TEAM_EVENT_EFFECTS: Record<
  ChemistryEvent,
  Partial<Record<keyof TeamChemistry, number>>
> = {
  "match-win": { chemistry: 3, unity: 4, morale: 5 },
  "match-loss": { chemistry: -2, unity: -2, morale: -4 },
  "winning-streak": { chemistry: 7, unity: 6, morale: 8 },
  "losing-streak": { chemistry: -6, unity: -5, morale: -7 },
  "captain-support": { leadershipTrust: 5, unity: 3 },
  "dropped-from-xi": { chemistry: -2, morale: -2 },
  "selected-for-xi": { chemistry: 2, unity: 2, morale: 3 },
  "team-milestone": { chemistry: 4, unity: 5, morale: 5 },
  "internal-conflict": {
    chemistry: -9,
    unity: -10,
    communication: -7,
  },
  "team-meeting": {
    chemistry: 3,
    unity: 4,
    communication: 5,
  },
};

export function applyChemistryEvent(
  player: PlayerMorale,
  team: TeamChemistry,
  event: ChemistryEvent,
): ChemistryEventResult {
  const playerChanges = PLAYER_EVENT_EFFECTS[event];
  const teamChanges = TEAM_EVENT_EFFECTS[event];

  const updatedPlayer: PlayerMorale = {
    ...player,
    morale: clamp(player.morale + (playerChanges.morale ?? 0)),
    confidence: clamp(
      player.confidence + (playerChanges.confidence ?? 0),
    ),
    happiness: clamp(
      player.happiness + (playerChanges.happiness ?? 0),
    ),
    leadership: clamp(
      player.leadership + (playerChanges.leadership ?? 0),
    ),
    lastUpdated: Date.now(),
  };

  const updatedTeam: TeamChemistry = {
    ...team,
    chemistry: clamp(
      team.chemistry + (teamChanges.chemistry ?? 0),
    ),
    unity: clamp(team.unity + (teamChanges.unity ?? 0)),
    communication: clamp(
      team.communication + (teamChanges.communication ?? 0),
    ),
    leadershipTrust: clamp(
      team.leadershipTrust + (teamChanges.leadershipTrust ?? 0),
    ),
    morale: clamp(team.morale + (teamChanges.morale ?? 0)),
    lastUpdated: Date.now(),
  };

  return {
    playerMorale: updatedPlayer,
    teamChemistry: updatedTeam,
    event,
  };
}

export function getMoraleLevel(
  morale: number,
): MoraleLevel {
  validateScore(morale, "Morale");

  if (morale >= 85) return "excellent";
  if (morale >= 70) return "good";
  if (morale >= 50) return "neutral";
  if (morale >= 30) return "low";

  return "poor";
}

export function getTeamChemistryRating(
  team: TeamChemistry,
): number {
  const rating =
    team.chemistry * 0.35 +
    team.unity * 0.25 +
    team.communication * 0.2 +
    team.leadershipTrust * 0.1 +
    team.morale * 0.1;

  return Math.round(rating);
}

export function getMoralePerformanceModifier(
  morale: number,
): number {
  validateScore(morale, "Morale");

  return clamp(0.85 + morale / 333, 0.85, 1.15);
}
