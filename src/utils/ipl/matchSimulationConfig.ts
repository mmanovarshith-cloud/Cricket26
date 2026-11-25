
export type MatchFormat = "T20" | "ODI" | "TEST";

export interface MatchSimulationConfig {
  format: MatchFormat;
  scheduledOvers: number;
  ballsPerOver: number;
  powerplayOvers: number;
  maximumOversPerBowler: number;
  maximumPlayers: number;
  inningsPerTeam: number;
  allowRainInterruptions: boolean;
  allowSuperOver: boolean;
  allowReviews: boolean;
}

export const MATCH_FORMAT_CONFIGS: Record<
  MatchFormat,
  MatchSimulationConfig
> = {
  T20: {
    format: "T20",
    scheduledOvers: 20,
    ballsPerOver: 6,
    powerplayOvers: 6,
    maximumOversPerBowler: 4,
    maximumPlayers: 11,
    inningsPerTeam: 1,
    allowRainInterruptions: true,
    allowSuperOver: true,
    allowReviews: true,
  },

  ODI: {
    format: "ODI",
    scheduledOvers: 50,
    ballsPerOver: 6,
    powerplayOvers: 10,
    maximumOversPerBowler: 10,
    maximumPlayers: 11,
    inningsPerTeam: 1,
    allowRainInterruptions: true,
    allowSuperOver: true,
    allowReviews: true,
  },

  TEST: {
    format: "TEST",
    scheduledOvers: 90,
    ballsPerOver: 6,
    powerplayOvers: 0,
    maximumOversPerBowler: 0,
    maximumPlayers: 11,
    inningsPerTeam: 2,
    allowRainInterruptions: true,
    allowSuperOver: false,
    allowReviews: true,
  },
};

export function getMatchConfig(
  format: MatchFormat,
): MatchSimulationConfig {
  return { ...MATCH_FORMAT_CONFIGS[format] };
}

export function validateMatchConfig(
  config: MatchSimulationConfig,
): void {
  if (
    !Number.isInteger(config.scheduledOvers) ||
    config.scheduledOvers <= 0
  ) {
    throw new Error("Scheduled overs must be a positive integer.");
  }

  if (config.ballsPerOver !== 6) {
    throw new Error("This simulation currently supports six-ball overs only.");
  }

  if (
    config.maximumPlayers !== 11 ||
    config.inningsPerTeam < 1
  ) {
    throw new Error("Invalid player or innings configuration.");
  }

  if (
    config.powerplayOvers < 0 ||
    config.powerplayOvers > config.scheduledOvers
  ) {
    throw new Error("Powerplay overs are outside the match limit.");
  }

  if (
    config.format !== "TEST" &&
    config.maximumOversPerBowler <= 0
  ) {
    throw new Error("Limited-overs matches require a bowling limit.");
  }

  if (
    config.format === "TEST" &&
    config.inningsPerTeam !== 2
  ) {
    throw new Error("Test matches require two innings per team.");
  }
}

export function getBowlingLimit(
  config: MatchSimulationConfig,
): number | null {
  return config.format === "TEST"
    ? null
    : config.maximumOversPerBowler;
}

export function getScheduledBallCount(
  config: MatchSimulationConfig,
): number {
  return config.scheduledOvers * config.ballsPerOver;
}
