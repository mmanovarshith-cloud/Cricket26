
export type ScoutingRegion =
  | "india"
  | "asia"
  | "europe"
  | "africa"
  | "oceania"
  | "americas";

export type ScoutingPotential =
  | "elite"
  | "high"
  | "medium"
  | "low";

export interface ScoutingCandidate {
  playerId: string;
  playerName: string;
  age: number;
  region: ScoutingRegion;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  fitnessRating: number;
  experience: number;
  isOverseas: boolean;
  estimatedValue: number;
}

export interface ScoutingReport {
  playerId: string;
  overallRating: number;
  potential: ScoutingPotential;
  roleStrength: number;
  developmentScore: number;
  estimatedValue: number;
  confidence: number;
  recommendation: "priority" | "consider" | "monitor" | "avoid";
  generatedAt: number;
}

export interface ScoutingAssignment {
  franchiseId: string;
  region: ScoutingRegion;
  durationDays: number;
  budget: number;
  completed: boolean;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function validateCandidate(candidate: ScoutingCandidate): void {
  if (!candidate.playerId.trim() || !candidate.playerName.trim()) {
    throw new Error("Player identity is required.");
  }

  if (!Number.isInteger(candidate.age) || candidate.age < 15 || candidate.age > 60) {
    throw new Error("Player age must be between 15 and 60.");
  }

  const ratings = [
    candidate.battingRating,
    candidate.bowlingRating,
    candidate.fieldingRating,
    candidate.fitnessRating,
    candidate.experience,
  ];

  if (ratings.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
    throw new Error("Player ratings must be between 0 and 100.");
  }

  if (!Number.isFinite(candidate.estimatedValue) || candidate.estimatedValue < 0) {
    throw new Error("Estimated value cannot be negative.");
  }
}

export function calculateScoutingOverall(
  candidate: ScoutingCandidate,
): number {
  validateCandidate(candidate);

  return Math.round(
    candidate.battingRating * 0.3 +
    candidate.bowlingRating * 0.3 +
    candidate.fieldingRating * 0.15 +
    candidate.fitnessRating * 0.15 +
    candidate.experience * 0.1,
  );
}

export function calculateDevelopmentPotential(
  candidate: ScoutingCandidate,
): number {
  validateCandidate(candidate);

  const ageFactor =
    candidate.age <= 21 ? 1 :
    candidate.age <= 24 ? 0.85 :
    candidate.age <= 27 ? 0.65 :
    candidate.age <= 30 ? 0.4 :
    0.2;

  const currentAbility = calculateScoutingOverall(candidate);
  const developmentRoom = 100 - currentAbility;

  return Math.round(
    clamp(developmentRoom * ageFactor),
  );
}

export function getScoutingPotential(
  developmentScore: number,
): ScoutingPotential {
  if (!Number.isFinite(developmentScore) || developmentScore < 0 || developmentScore > 100) {
    throw new Error("Development score must be between 0 and 100.");
  }

  if (developmentScore >= 75) return "elite";
  if (developmentScore >= 55) return "high";
  if (developmentScore >= 30) return "medium";

  return "low";
}

export function generateScoutingReport(
  candidate: ScoutingCandidate,
  scoutingAccuracy = 85,
): ScoutingReport {
  validateCandidate(candidate);

  if (!Number.isFinite(scoutingAccuracy) || scoutingAccuracy < 0 || scoutingAccuracy > 100) {
    throw new Error("Scouting accuracy must be between 0 and 100.");
  }

  const overallRating = calculateScoutingOverall(candidate);
  const developmentScore = calculateDevelopmentPotential(candidate);
  const potential = getScoutingPotential(developmentScore);

  const roleStrength = Math.max(
    candidate.battingRating,
    candidate.bowlingRating,
  );

  const recommendation =
    overallRating >= 85 && developmentScore >= 55
      ? "priority"
      : overallRating >= 75
        ? "consider"
        : overallRating >= 60
          ? "monitor"
          : "avoid";

  return {
    playerId: candidate.playerId,
    overallRating,
    potential,
    roleStrength,
    developmentScore,
    estimatedValue: candidate.estimatedValue,
    confidence: scoutingAccuracy,
    recommendation,
    generatedAt: Date.now(),
  };
}

export function rankScoutingCandidates(
  candidates: ScoutingCandidate[],
): ScoutingReport[] {
  const reports = candidates.map((candidate) =>
    generateScoutingReport(candidate),
  );

  return reports.sort(
    (a, b) =>
      b.overallRating + b.developmentScore * 0.25 -
      (a.overallRating + a.developmentScore * 0.25),
  );
}

export function createScoutingAssignment(
  franchiseId: string,
  region: ScoutingRegion,
  durationDays: number,
  budget: number,
): ScoutingAssignment {
  if (!franchiseId.trim()) {
    throw new Error("Franchise ID is required.");
  }

  if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 90) {
    throw new Error("Scouting duration must be between 1 and 90 days.");
  }

  if (!Number.isFinite(budget) || budget < 0) {
    throw new Error("Scouting budget cannot be negative.");
  }

  return {
    franchiseId,
    region,
    durationDays,
    budget,
    completed: false,
  };
}
