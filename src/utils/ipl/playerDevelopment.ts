
export type DevelopmentSkill =
  | "batting"
  | "bowling"
  | "fielding"
  | "fitness"
  | "mental";

export type TrainingIntensity = "light" | "normal" | "intense";

export interface PlayerDevelopment {
  playerId: string;
  batting: number;
  bowling: number;
  fielding: number;
  fitness: number;
  mental: number;
  experience: number;
  developmentPoints: number;
  trainingSessions: number;
}

export interface TrainingConfig {
  lightGain: number;
  normalGain: number;
  intenseGain: number;
  intenseFatigueCost: number;
  maximumSkill: number;
}

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  lightGain: 0.15,
  normalGain: 0.35,
  intenseGain: 0.55,
  intenseFatigueCost: 8,
  maximumSkill: 99,
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function getTrainingGain(
  intensity: TrainingIntensity,
  config: TrainingConfig,
): number {
  switch (intensity) {
    case "light":
      return config.lightGain;

    case "normal":
      return config.normalGain;

    case "intense":
      return config.intenseGain;
  }
}

export function createPlayerDevelopment(
  playerId: string,
  initialSkills: Omit<
    PlayerDevelopment,
    "playerId" | "experience" | "developmentPoints" | "trainingSessions"
  >,
): PlayerDevelopment {
  if (!playerId.trim()) {
    throw new Error("Player ID is required.");
  }

  const skills = [
    initialSkills.batting,
    initialSkills.bowling,
    initialSkills.fielding,
    initialSkills.fitness,
    initialSkills.mental,
  ];

  if (
    skills.some(
      (skill) => !Number.isFinite(skill) || skill < 0 || skill > 99,
    )
  ) {
    throw new Error("Player skills must be between 0 and 99.");
  }

  return {
    playerId,
    ...initialSkills,
    experience: 0,
    developmentPoints: 0,
    trainingSessions: 0,
  };
}

export function trainPlayer(
  player: PlayerDevelopment,
  skill: DevelopmentSkill,
  intensity: TrainingIntensity,
  config = DEFAULT_TRAINING_CONFIG,
): PlayerDevelopment {
  const gain = getTrainingGain(intensity, config);

  const updatedSkill = clamp(
    player[skill] + gain,
    0,
    config.maximumSkill,
  );

  const actualGain = updatedSkill - player[skill];

  return {
    ...player,
    [skill]: updatedSkill,
    experience: player.experience + 10,
    developmentPoints:
      player.developmentPoints + Math.max(0, actualGain),
    trainingSessions: player.trainingSessions + 1,
  };
}

export function applyMatchExperience(
  player: PlayerDevelopment,
  matchesPlayed: number,
  performanceBonus = 0,
): PlayerDevelopment {
  if (
    !Number.isInteger(matchesPlayed) ||
    matchesPlayed < 0 ||
    !Number.isFinite(performanceBonus) ||
    performanceBonus < 0
  ) {
    throw new Error("Invalid match experience values.");
  }

  return {
    ...player,
    experience:
      player.experience + matchesPlayed * 5 + performanceBonus,
    developmentPoints:
      player.developmentPoints + matchesPlayed * 0.1,
  };
}

export function improveSkillWithPoints(
  player: PlayerDevelopment,
  skill: DevelopmentSkill,
  points: number,
  config = DEFAULT_TRAINING_CONFIG,
): PlayerDevelopment {
  if (!Number.isFinite(points) || points <= 0) {
    throw new Error("Development points must be positive.");
  }

  if (player.developmentPoints < points) {
    throw new Error("Not enough development points.");
  }

  const updatedSkill = clamp(
    player[skill] + points,
    0,
    config.maximumSkill,
  );

  const actualCost = updatedSkill - player[skill];

  return {
    ...player,
    [skill]: updatedSkill,
    developmentPoints:
      player.developmentPoints - actualCost,
  };
}

export function getOverallPlayerRating(
  player: PlayerDevelopment,
): number {
  const overall =
    player.batting * 0.3 +
    player.bowling * 0.3 +
    player.fielding * 0.15 +
    player.fitness * 0.15 +
    player.mental * 0.1;

  return Math.round(overall);
}

export function getPlayerDevelopmentSummary(
  player: PlayerDevelopment,
): string {
  return [
    `Overall rating: ${getOverallPlayerRating(player)}`,
    `Experience: ${player.experience}`,
    `Development points: ${player.developmentPoints.toFixed(2)}`,
    `Training sessions: ${player.trainingSessions}`,
  ].join(" | ");
}
