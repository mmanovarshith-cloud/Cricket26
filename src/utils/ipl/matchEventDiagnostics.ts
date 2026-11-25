
import { matchEventBus } from "./matchEventBus";

export type MatchDiagnosticSeverity = "error" | "warning" | "info";

export interface MatchDiagnostic {
  severity: MatchDiagnosticSeverity;
  code: string;
  message: string;
}

export interface MatchEventDiagnosticReport {
  matchId: string;
  totalEvents: number;
  eventCounts: Record<string, number>;
  diagnostics: MatchDiagnostic[];
  isHealthy: boolean;
}

export function diagnoseMatchEvents(
  matchId: string,
): MatchEventDiagnosticReport {
  const diagnostics: MatchDiagnostic[] = [];

  const events = matchEventBus.getHistory(matchId);

  const eventCounts: Record<string, number> = {};

  for (const event of events) {
    eventCounts[event.type] = (eventCounts[event.type] ?? 0) + 1;
  }

  const types = events.map((event) => event.type);

  const hasMatchStarted = types.includes("match-started");
  const hasInningsStarted = types.includes("innings-started");
  const hasMatchCompleted = types.includes("match-completed");

  if (events.length === 0) {
    diagnostics.push({
      severity: "warning",
      code: "NO_EVENTS",
      message: "No events have been recorded for this match.",
    });
  }

  if (events.length > 0 && !hasMatchStarted) {
    diagnostics.push({
      severity: "error",
      code: "MISSING_MATCH_START",
      message: "The match has events but no match-started event.",
    });
  }

  if (hasMatchStarted && !hasInningsStarted && !hasMatchCompleted) {
    diagnostics.push({
      severity: "warning",
      code: "MISSING_INNINGS_START",
      message: "The match started, but no innings-started event was found.",
    });
  }

  if (hasMatchCompleted && !hasMatchStarted) {
    diagnostics.push({
      severity: "error",
      code: "INVALID_LIFECYCLE",
      message: "A match cannot be completed before it starts.",
    });
  }

  const matchStartIndex = types.indexOf("match-started");
  const inningsStartIndex = types.indexOf("innings-started");
  const matchCompleteIndex = types.indexOf("match-completed");

  if (
    matchStartIndex !== -1 &&
    inningsStartIndex !== -1 &&
    inningsStartIndex < matchStartIndex
  ) {
    diagnostics.push({
      severity: "error",
      code: "INVALID_INNINGS_ORDER",
      message: "An innings-started event occurred before the match started.",
    });
  }

  if (
    matchCompleteIndex !== -1 &&
    inningsStartIndex !== -1 &&
    matchCompleteIndex < inningsStartIndex
  ) {
    diagnostics.push({
      severity: "error",
      code: "INVALID_COMPLETION_ORDER",
      message: "The match completed before an innings started.",
    });
  }

  if (hasMatchCompleted && types.lastIndexOf("match-completed") !== types.length - 1) {
    diagnostics.push({
      severity: "warning",
      code: "EVENT_AFTER_COMPLETION",
      message: "Events were recorded after the match-completed event.",
    });
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      severity: "info",
      code: "EVENTS_HEALTHY",
      message: "No basic match event lifecycle problems were detected.",
    });
  }

  return {
    matchId,
    totalEvents: events.length,
    eventCounts,
    diagnostics,
    isHealthy: !diagnostics.some(
      (diagnostic) => diagnostic.severity === "error",
    ),
  };
}
