
export type TrainingDiscipline =
  | "batting"
  | "bowling"
  | "fielding"
  | "fitness"
  | "mental";

export type TrainingIntensity = "light" | "normal" | "intensive";

export interface PlayerTrainingAttributes {
  batting: number;
  bowling: number;
  fielding: number;
  fitness: number;
  mental: number;
}

export interface TrainingSession {
  playerId: string;
  discipline: TrainingDiscipline;
  intensity: TrainingIntensity;
  durationMinutes: number;
  completed: boolean;
  improvement: number;
  fatigueAdded: number;
  createdAt: number;
}

export interface TrainingResult {
  attributes: PlayerTrainingAttributes;
  session: TrainingSession;
  totalImprovement: number;
}

const INTENSITY_CONFIG: Record<
  TrainingIntensity,
  { improvement: number; fatigue: number }
> = {
  light: { improvement: 0.2, fatigue: 2 },
  normal: { improvement: 0.5, fatigue: 5 },
  intensive: { improvement: 0.8, fatigue: 10 },
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function validateAttributes(
  attributes: PlayerTrainingAttributes,
): void {
  const disciplines: TrainingDiscipline[] = [
    "batting",
    "bowling",
    "fielding",
    "fitness",
    "mental",
  ];

  for (const discipline of disciplines) {
    const value = attributes[discipline];

    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(
        `Player ${discipline} rating must be between 0 and 100.`,
      );
    }
  }
}

export function createTrainingAttributes(
  initialRating = 50,
): PlayerTrainingAttributes {
  if (
    !Number.isFinite(initialRating) ||
    initialRating < 0 ||
    initialRating > 100
  ) {
    throw new Error("Initial rating must be between 0 and 100.");
  }

  return {
    batting: initialRating,
    bowling: initialRating,
    fielding: initialRating,
    fitness: initialRating,
    mental: initialRating,
  };
}

export function calculateTrainingImprovement(
  currentRating: number,
  intensity: TrainingIntensity,
  durationMinutes: number,
): number {
  if (!Number.isFinite(currentRating) || currentRating < 0 || currentRating > 100) {
    throw new Error("Current rating must be between 0 and 100.");
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new Error("Training duration must be positive.");
  }

  const config = INTENSITY_CONFIG[intensity];

  if (!config) {
    throw new Error("Invalid training intensity.");
  }

  const durationFactor = Math.min(durationMinutes / 60, 2);
  const remainingPotential = (100 - currentRating) / 100;

  return Number(
    (config.improvement * durationFactor * remainingPotential).toFixed(2),
  );
}

export function completeTrainingSession(
  playerId: string,
  attributes: PlayerTrainingAttributes,
  discipline: TrainingDiscipline,
  intensity: TrainingIntensity,
  durationMinutes: number,
): TrainingResult {
  if (!playerId.trim()) {
    throw new Error("Player ID is required.");
  }

  validateAttributes(attributes);

  if (!(discipline in attributes)) {
    throw new Error("Invalid training discipline.");
  }

  const config = INTENSITY_CONFIG[intensity];

  if (!config) {
    throw new Error("Invalid training intensity.");
  }

  const improvement = calculateTrainingImprovement(
    attributes[discipline],
    intensity,
    durationMinutes,
  );

  const updatedAttributes = {
    ...attributes,
    [discipline]: clamp(
      attributes[discipline] + improvement,
    ),
  };

  const session: TrainingSession = {
    playerId,
    discipline,
    intensity,
    durationMinutes,
    completed: true,
    improvement,
    fatigueAdded: config.fatigue * Math.min(durationMinutes / 60, 2),
    createdAt: Date.now(),
  };

  return {
    attributes: updatedAttributes,
    session,
    totalImprovement: improvement,
  };
}

export function calculateTrainingOverall(
  attributes: PlayerTrainingAttributes,
): number {
  validateAttributes(attributes);

  const overall =
    attributes.batting * 0.25 +
    attributes.bowling * 0.25 +
    attributes.fielding * 0.2 +
    attributes.fitness * 0.15 +
    attributes.mental * 0.15;

  return Math.round(overall);
}

export function calculateTrainingReadiness(
  fitness: number,
  fatigue: number,
): number {
  if (
    !Number.isFinite(fitness) ||
    !Number.isFinite(fatigue) ||
    fitness < 0 ||
    fitness > 100 ||
    fatigue < 0 ||
    fatigue > 100
  ) {
    throw new Error("Fitness and fatigue must be between 0 and 100.");
  }

  return Math.round(
    clamp(fitness * 0.7 + (100 - fatigue) * 0.3),
  );
}
