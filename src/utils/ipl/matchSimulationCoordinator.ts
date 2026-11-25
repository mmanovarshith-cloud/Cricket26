
import {
  getMatchConfig,
  validateMatchConfig,
  type MatchFormat,
  type MatchSimulationConfig,
} from "./matchSimulationConfig";

import {
  calculateWeatherEffects,
  createDefaultWeather,
  type WeatherProfile,
  type MatchWeatherEffects,
} from "./weatherEngine";

import {
  createRainMatchState,
  type RainMatchState,
} from "./rainInterruptionEngine";

export interface MatchSimulationSession {
  matchId: string;
  config: MatchSimulationConfig;
  weather: WeatherProfile;
  weatherEffects: MatchWeatherEffects;
  rainState: RainMatchState | null;
  createdAt: number;
}

export function createMatchSimulation(
  matchId: string,
  format: MatchFormat = "T20",
  weather: WeatherProfile = createDefaultWeather(),
): MatchSimulationSession {
  if (!matchId.trim()) {
    throw new Error("Match ID is required.");
  }

  const config = getMatchConfig(format);

  validateMatchConfig(config);

  const weatherEffects = calculateWeatherEffects(weather);

  // The current rain engine supports a maximum of 50 scheduled overs.
  // Test matches therefore do not use this rain-state implementation.
  const rainState =
    format === "TEST"
      ? null
      : createRainMatchState(matchId, config.scheduledOvers);

  return {
    matchId,
    config,
    weather: { ...weather },
    weatherEffects,
    rainState,
    createdAt: Date.now(),
  };
}

export function updateMatchWeather(
  session: MatchSimulationSession,
  weather: WeatherProfile,
): MatchSimulationSession {
  const weatherEffects = calculateWeatherEffects(weather);

  return {
    ...session,
    weather: { ...weather },
    weatherEffects,
  };
}

export function getMatchSimulationSummary(
  session: MatchSimulationSession,
): {
  matchId: string;
  format: MatchFormat;
  scheduledOvers: number;
  playable: boolean;
  rainInterruptionSupported: boolean;
  weatherCondition: string;
} {
  return {
    matchId: session.matchId,
    format: session.config.format,
    scheduledOvers: session.config.scheduledOvers,
    playable: session.weatherEffects.playable,
    rainInterruptionSupported: session.rainState !== null,
    weatherCondition: session.weather.condition,
  };
}
