
import { matchEventBus } from "./matchEventBus";

export interface MatchEventExport {
  schemaVersion: 1;
  exportedAt: string;
  matchId: string;
  totalEvents: number;
  events: unknown[];
}

export function exportMatchEvents(
  matchId: string,
): MatchEventExport {
  if (!matchId.trim()) {
    throw new Error("A valid match ID is required.");
  }

  const events = matchEventBus.getHistory(matchId);

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    matchId,
    totalEvents: events.length,
    events: events.map((event) => ({ ...event })),
  };
}

export function downloadMatchEvents(
  matchId: string,
): void {
  const data = exportMatchEvents(matchId);

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `world-cricket-zenith-${matchId}-events.json`;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
