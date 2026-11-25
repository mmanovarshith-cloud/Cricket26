
import { matchEventBus } from "./matchEventBus";

export interface ReplayFrame {
  index: number;
  eventType: string;
  timestamp: number;
  payload: unknown;
}

export interface MatchReplay {
  matchId: string;
  frames: ReplayFrame[];
  totalFrames: number;
  durationMs: number;
}

export function createMatchReplay(
  matchId: string,
): MatchReplay {
  if (!matchId.trim()) {
    throw new Error("A valid match ID is required.");
  }

  const events = matchEventBus.getHistory(matchId);

  const frames: ReplayFrame[] = events.map((event, index) => ({
    index,
    eventType: event.type,
    timestamp: event.timestamp,
    payload: event.payload,
  }));

  const firstTimestamp = frames[0]?.timestamp ?? 0;
  const lastTimestamp =
    frames[frames.length - 1]?.timestamp ?? firstTimestamp;

  return {
    matchId,
    frames,
    totalFrames: frames.length,
    durationMs: Math.max(0, lastTimestamp - firstTimestamp),
  };
}

export function getReplayFrame(
  replay: MatchReplay,
  frameIndex: number,
): ReplayFrame | null {
  if (
    !Number.isInteger(frameIndex) ||
    frameIndex < 0 ||
    frameIndex >= replay.frames.length
  ) {
    return null;
  }

  return replay.frames[frameIndex];
}

export function getReplayFrameAtTime(
  replay: MatchReplay,
  elapsedMs: number,
): ReplayFrame | null {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return null;
  }

  if (replay.frames.length === 0) {
    return null;
  }

  const targetTimestamp =
    replay.frames[0].timestamp + elapsedMs;

  let selectedFrame = replay.frames[0];

  for (const frame of replay.frames) {
    if (frame.timestamp > targetTimestamp) {
      break;
    }

    selectedFrame = frame;
  }

  return selectedFrame;
}
