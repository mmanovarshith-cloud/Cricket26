
export type PitchType =
  | "batting-friendly"
  | "bowling-friendly"
  | "balanced"
  | "spin-friendly"
  | "pace-friendly";

export type GroundCondition =
  | "excellent"
  | "good"
  | "average"
  | "poor";

export interface Stadium {
  stadiumId: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  homeFranchiseId: string | null;
  pitchType: PitchType;
  groundCondition: GroundCondition;
  boundarySize: number;
  floodlights: boolean;
  internationalVenue: boolean;
  reputation: number;
}

export interface StadiumMatchProfile {
  stadiumId: string;
  battingModifier: number;
  bowlingModifier: number;
  spinModifier: number;
  paceModifier: number;
  homeAdvantage: number;
  attendanceCapacity: number;
}

const PITCH_MODIFIERS: Record<
  PitchType,
  {
    batting: number;
    bowling: number;
    spin: number;
    pace: number;
  }
> = {
  "batting-friendly": {
    batting: 1.12,
    bowling: 0.92,
    spin: 0.98,
    pace: 0.98,
  },
  "bowling-friendly": {
    batting: 0.9,
    bowling: 1.12,
    spin: 1.05,
    pace: 1.05,
  },
  balanced: {
    batting: 1,
    bowling: 1,
    spin: 1,
    pace: 1,
  },
  "spin-friendly": {
    batting: 0.96,
    bowling: 1.08,
    spin: 1.18,
    pace: 0.92,
  },
  "pace-friendly": {
    batting: 0.95,
    bowling: 1.1,
    spin: 0.9,
    pace: 1.18,
  },
};

const CONDITION_MODIFIERS: Record<
  GroundCondition,
  number
> = {
  excellent: 1.05,
  good: 1,
  average: 0.95,
  poor: 0.85,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function validateStadium(stadium: Stadium): void {
  if (
    !stadium.stadiumId.trim() ||
    !stadium.name.trim() ||
    !stadium.city.trim() ||
    !stadium.country.trim()
  ) {
    throw new Error("Stadium identity and location are required.");
  }

  if (
    !Number.isInteger(stadium.capacity) ||
    stadium.capacity < 1000
  ) {
    throw new Error("Stadium capacity must be at least 1,000.");
  }

  if (
    !Number.isFinite(stadium.boundarySize) ||
    stadium.boundarySize <= 0
  ) {
    throw new Error("Boundary size must be positive.");
  }

  if (
    !Number.isFinite(stadium.reputation) ||
    stadium.reputation < 0 ||
    stadium.reputation > 100
  ) {
    throw new Error("Stadium reputation must be between 0 and 100.");
  }
}

export function createStadiumMatchProfile(
  stadium: Stadium,
  battingTeamFranchiseId: string,
  bowlingTeamFranchiseId: string,
): StadiumMatchProfile {
  validateStadium(stadium);

  const pitch = PITCH_MODIFIERS[stadium.pitchType];
  const condition = CONDITION_MODIFIERS[stadium.groundCondition];

  const battingModifier = pitch.batting * condition;
  const bowlingModifier = pitch.bowling * condition;

  const homeAdvantage =
    stadium.homeFranchiseId !== null &&
    (
      stadium.homeFranchiseId === battingTeamFranchiseId ||
      stadium.homeFranchiseId === bowlingTeamFranchiseId
    )
      ? 1.05
      : 1;

  return {
    stadiumId: stadium.stadiumId,
    battingModifier: Number(battingModifier.toFixed(3)),
    bowlingModifier: Number(bowlingModifier.toFixed(3)),
    spinModifier: Number(pitch.spin.toFixed(3)),
    paceModifier: Number(pitch.pace.toFixed(3)),
    homeAdvantage,
    attendanceCapacity: stadium.capacity,
  };
}

export function calculateExpectedAttendance(
  stadium: Stadium,
  demand: number,
): number {
  validateStadium(stadium);

  if (!Number.isFinite(demand) || demand < 0) {
    throw new Error("Attendance demand cannot be negative.");
  }

  const reputationFactor = 0.5 + stadium.reputation / 200;

  return Math.round(
    clamp(
      demand * reputationFactor,
      0,
      stadium.capacity,
    ),
  );
}

export function calculateBoundaryDifficulty(
  stadium: Stadium,
): number {
  validateStadium(stadium);

  return Number(
    clamp(1.2 - stadium.boundarySize / 100, 0.7, 1.2).toFixed(3),
  );
}

export function getStadiumsByFranchise(
  stadiums: Stadium[],
  franchiseId: string,
): Stadium[] {
  return stadiums.filter(
    (stadium) => stadium.homeFranchiseId === franchiseId,
  );
}

export function getInternationalStadiums(
  stadiums: Stadium[],
): Stadium[] {
  return stadiums.filter(
    (stadium) => stadium.internationalVenue,
  );
}
