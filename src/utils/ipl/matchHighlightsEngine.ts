
import { matchEventBus } from "./matchEventBus";

export type MatchHighlightType =
  | "six"
  | "four"
  | "wicket"
  | "innings-start"
  | "innings-finish"
  | "match-finish";

export interface MatchHighlight {
  id: string;
  matchId: string;
  type: MatchHighlightType;
  frameIndex: number;
  timestamp: number;
  title: string;
  description: string;
  importance: number;
}

export interface HighlightOptions {
  includeFours: boolean;
  includeSixes: boolean;
  includeWickets: boolean;
  includeInningsEvents: boolean;
  includeMatchFinish: boolean;
  minimumImportance: number;
}

const DEFAULT_OPTIONS: HighlightOptions = {
  includeFours: true,
  includeSixes: true,
  includeWickets: true,
  includeInningsEvents: true,
  includeMatchFinish: true,
  minimumImportance: 1,
};

export function generateMatchHighlights(
  matchId: string,
  options: Partial<HighlightOptions> = {},
): MatchHighlight[] {
  if (!matchId.trim()) {
    throw new Error("A valid match ID is required.");
  }

  const settings = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const events = matchEventBus.getHistory(matchId);
  const highlights: MatchHighlight[] = [];

  events.forEach((event, index) => {
    const payload = event.payload as Record<string, unknown>;
    let type: MatchHighlightType | null = null;
    let title = "";
    let description = "";
    let importance = 1;

    switch (event.type) {
      case "boundary-scored": {
        const runs = Number(payload?.runs);
        const boundaryType = String(payload?.boundaryType ?? "");

        if (runs === 6 || boundaryType === "six") {
          if (!settings.includeSixes) break;

          type = "six";
          title = "Six!";
          description = "A maximum has been scored.";
          importance = 5;
        } else if (runs === 4 || boundaryType === "four") {
          if (!settings.includeFours) break;

          type = "four";
          title = "Four!";
          description = "A boundary has been scored.";
          importance = 3;
        }

        break;
      }

      case "wicket-fallen":
        if (!settings.includeWickets) break;

        type = "wicket";
        title = "Wicket!";
        description = "A batter has been dismissed.";
        importance = 5;
        break;

      case "innings-started":
        if (!settings.includeInningsEvents) break;

        type = "innings-start";
        title = "Innings started";
        description = "A new innings has begun.";
        importance = 2;
        break;

      case "innings-completed":
        if (!settings.includeInningsEvents) break;

        type = "innings-finish";
        title = "Innings completed";
        description = "The innings has ended.";
        importance = 3;
        break;

      case "match-completed":
        if (!settings.includeMatchFinish) break;

        type = "match-finish";
        title = "Match completed";
        description = "The match result has been recorded.";
        importance = 5;
        break;
    }

    if (type && importance >= settings.minimumImportance) {
      highlights.push({
        id: `${matchId}-highlight-${index}`,
        matchId,
        type,
        frameIndex: index,
        timestamp: event.timestamp,
        title,
        description,
        importance,
      });
    }
  });

  return highlights;
}

export function getTopMatchHighlights(
  highlights: MatchHighlight[],
  limit = 5,
): MatchHighlight[] {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error("Highlight limit must be a non-negative integer.");
  }

  return [...highlights]
    .sort((a, b) => {
      if (b.importance !== a.importance) {
        return b.importance - a.importance;
      }

      return a.frameIndex - b.frameIndex;
    })
    .slice(0, limit);
}
