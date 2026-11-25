
import type { MatchReplay, ReplayFrame } from "./matchReplayEngine";

export interface ReplayTimelineMarker {
  frameIndex: number;
  eventType: string;
  timestamp: number;
  label: string;
  category: "delivery" | "wicket" | "boundary" | "innings" | "match";
}

export interface ReplayTimelineSummary {
  totalFrames: number;
  durationMs: number;
  markers: ReplayTimelineMarker[];
  wickets: number;
  boundaries: number;
  innings: number;
}

function getCategory(
  eventType: string,
): ReplayTimelineMarker["category"] {
  if (eventType === "delivery-completed") return "delivery";
  if (eventType === "wicket-fallen") return "wicket";
  if (eventType === "boundary-scored") return "boundary";
  if (eventType.startsWith("innings-")) return "innings";
  return "match";
}

function getLabel(frame: ReplayFrame): string {
  switch (frame.eventType) {
    case "delivery-completed":
      return "Delivery";
    case "wicket-fallen":
      return "Wicket";
    case "boundary-scored":
      return "Boundary";
    case "innings-started":
      return "Innings started";
    case "innings-completed":
      return "Innings completed";
    case "match-completed":
      return "Match completed";
    default:
      return frame.eventType;
  }
}

export function buildReplayTimeline(
  replay: MatchReplay,
): ReplayTimelineSummary {
  const markers = replay.frames.map((frame) => ({
    frameIndex: frame.index,
    eventType: frame.eventType,
    timestamp: frame.timestamp,
    label: getLabel(frame),
    category: getCategory(frame.eventType),
  }));

  return {
    totalFrames: replay.totalFrames,
    durationMs: replay.durationMs,
    markers,
    wickets: markers.filter(
      (marker) => marker.category === "wicket",
    ).length,
    boundaries: markers.filter(
      (marker) => marker.category === "boundary",
    ).length,
    innings: markers.filter(
      (marker) => marker.category === "innings",
    ).length,
  };
}

export function findReplayMarkers(
  timeline: ReplayTimelineSummary,
  category: ReplayTimelineMarker["category"],
): ReplayTimelineMarker[] {
  return timeline.markers.filter(
    (marker) => marker.category === category,
  );
}

export function findNearestReplayMarker(
  timeline: ReplayTimelineSummary,
  frameIndex: number,
): ReplayTimelineMarker | null {
  if (timeline.markers.length === 0) {
    return null;
  }

  return timeline.markers.reduce((nearest, marker) => {
    const currentDistance = Math.abs(
      marker.frameIndex - frameIndex,
    );

    const nearestDistance = Math.abs(
      nearest.frameIndex - frameIndex,
    );

    return currentDistance < nearestDistance ? marker : nearest;
  });
}
