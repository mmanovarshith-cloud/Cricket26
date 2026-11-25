
import {
  matchEventBus,
  type MatchEvent,
} from "./matchEventBus";

export interface DeliveryEventData {
  batterId: string;
  batterName: string;
  bowlerId: string;
  bowlerName: string;

  batterRuns: number;
  totalRuns: number;
  extraRuns: number;

  legalDelivery: boolean;
  isFour: boolean;
  isSix: boolean;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;

  wicketType?: string;
}

export interface InningsStartEventData {
  innings: number;
  battingTeam: string;
  bowlingTeam: string;
  target?: number;
}

export interface InningsCompleteEventData {
  innings: number;
  totalRuns: number;
  wickets: number;
  legalBalls: number;
  target?: number;
}

function validateDelivery(data: DeliveryEventData): void {
  if (
    !data.batterId.trim() ||
    !data.batterName.trim() ||
    !data.bowlerId.trim() ||
    !data.bowlerName.trim()
  ) {
    throw new Error("Batter and bowler details are required.");
  }

  const values = [
    data.batterRuns,
    data.totalRuns,
    data.extraRuns,
  ];

  if (
    values.some(
      (value) =>
        !Number.isInteger(value) ||
        value < 0,
    )
  ) {
    throw new Error("Delivery runs must be non-negative integers.");
  }

  if (data.batterRuns > data.totalRuns) {
    throw new Error("Batter runs cannot exceed total runs.");
  }

  if (data.extraRuns > data.totalRuns) {
    throw new Error("Extra runs cannot exceed total runs.");
  }

  if (data.isFour && data.isSix) {
    throw new Error("A delivery cannot be both four and six.");
  }
}

export function publishMatchStarted(
  matchId: string,
  format: string,
  scheduledOvers: number,
): MatchEvent {
  if (
    !matchId.trim() ||
    !format.trim() ||
    !Number.isInteger(scheduledOvers) ||
    scheduledOvers <= 0
  ) {
    throw new Error("Invalid match-start information.");
  }

  return matchEventBus.publish(
    matchId,
    "match-started",
    { format, scheduledOvers },
  );
}

export function publishInningsStarted(
  matchId: string,
  data: InningsStartEventData,
): MatchEvent {
  if (
    !matchId.trim() ||
    !Number.isInteger(data.innings) ||
    data.innings < 1 ||
    !data.battingTeam.trim() ||
    !data.bowlingTeam.trim()
  ) {
    throw new Error("Invalid innings-start information.");
  }

  return matchEventBus.publish(
    matchId,
    "innings-started",
    data,
  );
}

export function publishDeliveryCompleted(
  matchId: string,
  data: DeliveryEventData,
): MatchEvent {
  validateDelivery(data);

  const event = matchEventBus.publish(
    matchId,
    "delivery-completed",
    {
      ...data,
      runs: data.totalRuns,
      isLegalDelivery: data.legalDelivery,
      isWicket: data.isWicket,
    },
  );

  if (data.isFour || data.isSix) {
    matchEventBus.publish(
      matchId,
      "boundary-scored",
      {
        batterName: data.batterName,
        runs: data.isSix ? 6 : 4,
      },
    );
  }

  if (data.isWicket) {
    matchEventBus.publish(
      matchId,
      "wicket-fallen",
      {
        playerName: data.batterName,
        wicketType: data.wicketType ?? "unknown",
      },
    );
  }

  return event;
}

export function publishInningsCompleted(
  matchId: string,
  data: InningsCompleteEventData,
): MatchEvent {
  return matchEventBus.publish(
    matchId,
    "innings-completed",
    data,
  );
}

export function publishMatchCompleted(
  matchId: string,
  winner: string,
  result: string,
): MatchEvent {
  if (!matchId.trim() || !winner.trim() || !result.trim()) {
    throw new Error("Match result information is required.");
  }

  return matchEventBus.publish(
    matchId,
    "match-completed",
    { winner, result },
  );
}
