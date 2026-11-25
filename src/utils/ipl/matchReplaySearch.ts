
import type {
  MatchReplay,
  ReplayFrame,
} from "./matchReplayEngine";

export interface ReplaySearchOptions {
  eventTypes?: string[];
  searchText?: string;
  startTimestamp?: number;
  endTimestamp?: number;
}

export interface ReplaySearchResult {
  frame: ReplayFrame;
  matchId: string;
  matchedIndex: number;
}

export function searchMatchReplay(
  replay: MatchReplay,
  options: ReplaySearchOptions = {},
): ReplaySearchResult[] {
  const {
    eventTypes,
    searchText,
    startTimestamp,
    endTimestamp,
  } = options;

  const normalizedSearch = searchText?.trim().toLowerCase();

  return replay.frames
    .filter((frame) => {
      if (
        eventTypes &&
        eventTypes.length > 0 &&
        !eventTypes.includes(frame.eventType)
      ) {
        return false;
      }

      if (
        startTimestamp !== undefined &&
        frame.timestamp < startTimestamp
      ) {
        return false;
      }

      if (
        endTimestamp !== undefined &&
        frame.timestamp > endTimestamp
      ) {
        return false;
      }

      if (normalizedSearch) {
        const searchableText = [
          frame.eventType,
          JSON.stringify(frame.payload),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    })
    .map((frame) => ({
      frame,
      matchId: replay.matchId,
      matchedIndex: frame.index,
    }));
}

export function findReplayFrameByIndex(
  replay: MatchReplay,
  frameIndex: number,
): ReplayFrame | null {
  if (!Number.isInteger(frameIndex) || frameIndex < 0) {
    return null;
  }

  return replay.frames.find(
    (frame) => frame.index === frameIndex,
  ) ?? null;
}

export function countReplayEventsByType(
  replay: MatchReplay,
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const frame of replay.frames) {
    counts[frame.eventType] =
      (counts[frame.eventType] ?? 0) + 1;
  }

  return counts;
}
