
import {
  matchEventBus,
  type MatchEvent,
  type MatchEventSubscription,
} from "./matchEventBus";

import {
  createMatchSimulation,
  updateMatchWeather,
  type MatchSimulationSession,
} from "./matchSimulationCoordinator";

import type {
  MatchFormat,
} from "./matchSimulationConfig";

import type {
  WeatherProfile,
} from "./weatherEngine";

export function startIntegratedMatch(
  matchId: string,
  format: MatchFormat = "T20",
  weather?: WeatherProfile,
): MatchSimulationSession {
  const session = weather
    ? createMatchSimulation(matchId, format, weather)
    : createMatchSimulation(matchId, format);

  matchEventBus.publish(matchId, "match-started", {
    format: session.config.format,
    scheduledOvers: session.config.scheduledOvers,
    weather: session.weather,
  });

  return session;
}

export function changeMatchWeather(
  session: MatchSimulationSession,
  weather: WeatherProfile,
): MatchSimulationSession {
  const updatedSession = updateMatchWeather(
    session,
    weather,
  );

  matchEventBus.publish(
    session.matchId,
    "weather-changed",
    {
      condition: weather.condition,
      effects: updatedSession.weatherEffects,
    },
  );

  return updatedSession;
}

export function subscribeToMatch(
  matchId: string,
  listener: (event: MatchEvent) => void,
): MatchEventSubscription {
  if (!matchId.trim()) {
    throw new Error("Match ID is required.");
  }

  const eventTypes = [
    "match-started",
    "innings-started",
    "delivery-completed",
    "boundary-scored",
    "wicket-fallen",
    "over-completed",
    "innings-completed",
    "weather-changed",
    "rain-interruption",
    "match-resumed",
    "match-abandoned",
    "match-completed",
  ] as const;

  const subscriptions = eventTypes.map((type) =>
    matchEventBus.subscribe(type, (event) => {
      if (event.matchId === matchId) {
        listener(event);
      }
    }),
  );

  return {
    unsubscribe: () => {
      subscriptions.forEach((subscription) =>
        subscription.unsubscribe(),
      );
    },
  };
}
