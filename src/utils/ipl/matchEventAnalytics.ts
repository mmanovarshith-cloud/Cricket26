
import { matchEventBus } from "./matchEventBus";

export interface MatchEventAnalytics {
  matchId: string;
  totalEvents: number;
  deliveries: number;
  boundaries: number;
  fours: number;
  sixes: number;
  wickets: number;
  inningsStarted: number;
  inningsCompleted: number;
  matchCompleted: boolean;
  eventFrequency: Record<string, number>;
}

export function calculateMatchEventAnalytics(
  matchId: string,
): MatchEventAnalytics {
  const events = matchEventBus.getHistory(matchId);

  const eventFrequency: Record<string, number> = {};

  let deliveries = 0;
  let boundaries = 0;
  let fours = 0;
  let sixes = 0;
  let wickets = 0;
  let inningsStarted = 0;
  let inningsCompleted = 0;
  let matchCompleted = false;

  for (const event of events) {
    eventFrequency[event.type] =
      (eventFrequency[event.type] ?? 0) + 1;

    switch (event.type) {
      case "delivery-completed":
        deliveries++;
        break;

      case "boundary-scored": {
        boundaries++;

        const payload = event.payload as {
          runs?: number;
          boundaryType?: string;
        };

        if (payload.runs === 4 || payload.boundaryType === "four") {
          fours++;
        }

        if (payload.runs === 6 || payload.boundaryType === "six") {
          sixes++;
        }

        break;
      }

      case "wicket-fallen":
        wickets++;
        break;

      case "innings-started":
        inningsStarted++;
        break;

      case "innings-completed":
        inningsCompleted++;
        break;

      case "match-completed":
        matchCompleted = true;
        break;
    }
  }

  return {
    matchId,
    totalEvents: events.length,
    deliveries,
    boundaries,
    fours,
    sixes,
    wickets,
    inningsStarted,
    inningsCompleted,
    matchCompleted,
    eventFrequency,
  };
}
