
export type CareerPhase =
  | "young-prospect"
  | "developing"
  | "prime"
  | "experienced"
  | "veteran"
  | "retired";

export interface PlayerCareer {
  playerId: string;
  age: number;
  professionalSeasons: number;
  matchesPlayed: number;
  careerRuns: number;
  careerWickets: number;
  careerCatches: number;
  careerExperience: number;
  phase: CareerPhase;
  isRetired: boolean;
  retirementSeason: number | null;
}

export interface CareerConfig {
  youngProspectAge: number;
  developingAge: number;
  primeStartAge: number;
  experiencedAge: number;
  veteranAge: number;
  retirementAge: number;
  maximumAge: number;
}

export const DEFAULT_CAREER_CONFIG: CareerConfig = {
  youngProspectAge: 18,
  developingAge: 21,
  primeStartAge: 24,
  experiencedAge: 30,
  veteranAge: 34,
  retirementAge: 40,
  maximumAge: 50,
};

export function createPlayerCareer(
  playerId: string,
  age: number,
): PlayerCareer {
  if (!playerId.trim()) {
    throw new Error("Player ID is required.");
  }

  if (!Number.isInteger(age) || age < 15 || age > 50) {
    throw new Error("Player age must be between 15 and 50.");
  }

  return {
    playerId,
    age,
    professionalSeasons: 0,
    matchesPlayed: 0,
    careerRuns: 0,
    careerWickets: 0,
    careerCatches: 0,
    careerExperience: 0,
    phase: determineCareerPhase(age),
    isRetired: false,
    retirementSeason: null,
  };
}

export function determineCareerPhase(
  age: number,
  config = DEFAULT_CAREER_CONFIG,
): CareerPhase {
  if (age < config.developingAge) return "young-prospect";
  if (age < config.primeStartAge) return "developing";
  if (age < config.experiencedAge) return "prime";
  if (age < config.veteranAge) return "experienced";
  if (age < config.retirementAge) return "veteran";

  return "retired";
}

export function updateCareerStatistics(
  career: PlayerCareer,
  match: {
    runs: number;
    wickets: number;
    catches: number;
    matchesPlayed?: number;
  },
): PlayerCareer {
  if (career.isRetired) {
    throw new Error("A retired player cannot receive match statistics.");
  }

  const values = [
    match.runs,
    match.wickets,
    match.catches,
    match.matchesPlayed ?? 1,
  ];

  if (
    values.some(
      (value) => !Number.isInteger(value) || value < 0,
    )
  ) {
    throw new Error("Career statistics must be non-negative integers.");
  }

  return {
    ...career,
    matchesPlayed:
      career.matchesPlayed + (match.matchesPlayed ?? 1),
    careerRuns: career.careerRuns + match.runs,
    careerWickets: career.careerWickets + match.wickets,
    careerCatches: career.careerCatches + match.catches,
    careerExperience: career.careerExperience + 10,
  };
}

export function advancePlayerCareerSeason(
  career: PlayerCareer,
): PlayerCareer {
  if (career.isRetired) return career;

  const nextAge = career.age + 1;
  const nextPhase = determineCareerPhase(nextAge);

  return {
    ...career,
    age: nextAge,
    professionalSeasons: career.professionalSeasons + 1,
    phase: nextPhase,
  };
}

export function retirePlayer(
  career: PlayerCareer,
  season: number,
): PlayerCareer {
  if (!Number.isInteger(season) || season < 2000) {
    throw new Error("A valid retirement season is required.");
  }

  return {
    ...career,
    phase: "retired",
    isRetired: true,
    retirementSeason: season,
  };
}

export function getCareerSummary(
  career: PlayerCareer,
): string {
  return [
    `Age: ${career.age}`,
    `Career phase: ${career.phase}`,
    `Seasons: ${career.professionalSeasons}`,
    `Matches: ${career.matchesPlayed}`,
    `Runs: ${career.careerRuns}`,
    `Wickets: ${career.careerWickets}`,
    `Catches: ${career.careerCatches}`,
  ].join(" | ");
}
