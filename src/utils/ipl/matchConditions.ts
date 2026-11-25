
export type PitchType =
  | "flat"
  | "green"
  | "dry"
  | "dusty"
  | "hard"
  | "dead";

export type WeatherType =
  | "sunny"
  | "cloudy"
  | "overcast"
  | "rainy"
  | "humid"
  | "windy";

export type GroundCondition =
  | "dry"
  | "normal"
  | "wet";

export interface MatchConditions {
  pitch: PitchType;
  weather: WeatherType;
  ground: GroundCondition;
  temperatureCelsius: number;
  humidityPercent: number;
  windSpeedKph: number;
  dewFactor: number;
}

export interface ConditionModifiers {
  battingDifficulty: number;
  paceBowlingEffectiveness: number;
  swingBowlingEffectiveness: number;
  spinBowlingEffectiveness: number;
  bounceFactor: number;
  ballGrip: number;
  outfieldSpeed: number;
  fieldingDifficulty: number;
}

export interface MatchConditionsInput {
  pitch: PitchType;
  weather: WeatherType;
  ground: GroundCondition;
  temperatureCelsius: number;
  humidityPercent: number;
  windSpeedKph: number;
  dewFactor: number;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function validateConditions(
  conditions: MatchConditionsInput,
): void {
  if (
    !Number.isFinite(conditions.temperatureCelsius) ||
    conditions.temperatureCelsius < -10 ||
    conditions.temperatureCelsius > 60
  ) {
    throw new Error("Temperature must be between -10°C and 60°C.");
  }

  if (
    !Number.isFinite(conditions.humidityPercent) ||
    conditions.humidityPercent < 0 ||
    conditions.humidityPercent > 100
  ) {
    throw new Error("Humidity must be between 0 and 100.");
  }

  if (
    !Number.isFinite(conditions.windSpeedKph) ||
    conditions.windSpeedKph < 0 ||
    conditions.windSpeedKph > 200
  ) {
    throw new Error("Wind speed must be between 0 and 200 km/h.");
  }

  if (
    !Number.isFinite(conditions.dewFactor) ||
    conditions.dewFactor < 0 ||
    conditions.dewFactor > 1
  ) {
    throw new Error("Dew factor must be between 0 and 1.");
  }
}

export function createMatchConditions(
  input: MatchConditionsInput,
): MatchConditions {
  validateConditions(input);

  return { ...input };
}

export function calculateConditionModifiers(
  conditions: MatchConditions,
): ConditionModifiers {
  validateConditions(conditions);

  let battingDifficulty = 1;
  let paceBowlingEffectiveness = 1;
  let swingBowlingEffectiveness = 1;
  let spinBowlingEffectiveness = 1;
  let bounceFactor = 1;
  let ballGrip = 1;
  let outfieldSpeed = 1;
  let fieldingDifficulty = 1;

  switch (conditions.pitch) {
    case "flat":
      battingDifficulty *= 0.85;
      paceBowlingEffectiveness *= 0.9;
      spinBowlingEffectiveness *= 0.9;
      break;

    case "green":
      battingDifficulty *= 1.15;
      paceBowlingEffectiveness *= 1.2;
      swingBowlingEffectiveness *= 1.15;
      break;

    case "dry":
      battingDifficulty *= 1.05;
      spinBowlingEffectiveness *= 1.2;
      ballGrip *= 1.15;
      break;

    case "dusty":
      battingDifficulty *= 1.15;
      spinBowlingEffectiveness *= 1.3;
      ballGrip *= 1.2;
      break;

    case "hard":
      bounceFactor *= 1.15;
      paceBowlingEffectiveness *= 1.1;
      break;

    case "dead":
      battingDifficulty *= 0.95;
      bounceFactor *= 0.9;
      paceBowlingEffectiveness *= 0.9;
      break;
  }

  switch (conditions.weather) {
    case "cloudy":
      swingBowlingEffectiveness *= 1.1;
      break;

    case "overcast":
      swingBowlingEffectiveness *= 1.2;
      battingDifficulty *= 1.05;
      break;

    case "rainy":
      fieldingDifficulty *= 1.2;
      outfieldSpeed *= 0.85;
      break;

    case "humid":
      swingBowlingEffectiveness *= 1.1;
      break;

    case "windy":
      fieldingDifficulty *= 1.1;
      break;

    case "sunny":
      break;
  }

  switch (conditions.ground) {
    case "dry":
      outfieldSpeed *= 1.1;
      break;

    case "wet":
      outfieldSpeed *= 0.85;
      fieldingDifficulty *= 1.2;
      ballGrip *= 0.8;
      break;

    case "normal":
      break;
  }

  const humidityEffect =
    conditions.humidityPercent / 100;

  swingBowlingEffectiveness *=
    0.95 + humidityEffect * 0.1;

  const windEffect = clamp(
    conditions.windSpeedKph / 100,
    0,
    0.2,
  );

  fieldingDifficulty *= 1 + windEffect;

  const dewEffect = conditions.dewFactor;

  ballGrip *= 1 - dewEffect * 0.25;
  spinBowlingEffectiveness *= 1 - dewEffect * 0.2;
  outfieldSpeed *= 1 + dewEffect * 0.15;

  return {
    battingDifficulty: clamp(battingDifficulty, 0.65, 1.5),
    paceBowlingEffectiveness: clamp(
      paceBowlingEffectiveness,
      0.65,
      1.5,
    ),
    swingBowlingEffectiveness: clamp(
      swingBowlingEffectiveness,
      0.65,
      1.5,
    ),
    spinBowlingEffectiveness: clamp(
      spinBowlingEffectiveness,
      0.65,
      1.5,
    ),
    bounceFactor: clamp(bounceFactor, 0.7, 1.4),
    ballGrip: clamp(ballGrip, 0.6, 1.4),
    outfieldSpeed: clamp(outfieldSpeed, 0.6, 1.4),
    fieldingDifficulty: clamp(fieldingDifficulty, 0.7, 1.5),
  };
}

export function getPitchDescription(
  pitch: PitchType,
): string {
  const descriptions: Record<PitchType, string> = {
    flat: "A batting-friendly surface with consistent bounce.",
    green: "A surface offering assistance to seam and swing bowling.",
    dry: "A dry surface that may assist spin as the match progresses.",
    dusty: "A rough surface offering significant grip for spin.",
    hard: "A firm surface with lively bounce.",
    dead: "A slow surface with limited bounce and movement.",
  };

  return descriptions[pitch];
}

export function getWeatherDescription(
  weather: WeatherType,
): string {
  const descriptions: Record<WeatherType, string> = {
    sunny: "Clear conditions with plenty of sunshine.",
    cloudy: "Cloud cover may provide some assistance to swing bowling.",
    overcast: "Overcast conditions may favour movement through the air.",
    rainy: "Rain may interrupt play and affect ground conditions.",
    humid: "Humid conditions may influence swing and player fatigue.",
    windy: "Wind may influence ball movement and fielding.",
  };

  return descriptions[weather];
}

export function getMatchConditionsSummary(
  conditions: MatchConditions,
): string[] {
  return [
    getPitchDescription(conditions.pitch),
    getWeatherDescription(conditions.weather),
    `Ground condition: ${conditions.ground}.`,
    `Temperature: ${conditions.temperatureCelsius}°C.`,
    `Humidity: ${conditions.humidityPercent}%.`,
    `Wind speed: ${conditions.windSpeedKph} km/h.`,
  ];
}
