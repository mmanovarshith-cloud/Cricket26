
import type {
  MatchReplay,
  ReplayFrame,
} from "./matchReplayEngine";

export interface ReplayValidationIssue {
  code: string;
  message: string;
  frameIndex?: number;
}

export interface ReplayValidationResult {
  isValid: boolean;
  checkedFrames: number;
  issues: ReplayValidationIssue[];
}

export function validateReplayFrame(
  frame: ReplayFrame,
  expectedIndex: number,
): ReplayValidationIssue[] {
  const issues: ReplayValidationIssue[] = [];

  if (frame.index !== expectedIndex) {
    issues.push({
      code: "INVALID_FRAME_INDEX",
      message: "Replay frame index does not match its position.",
      frameIndex: expectedIndex,
    });
  }

  if (!frame.eventType.trim()) {
    issues.push({
      code: "MISSING_EVENT_TYPE",
      message: "Replay frame has no event type.",
      frameIndex: expectedIndex,
    });
  }

  if (
    !Number.isFinite(frame.timestamp) ||
    frame.timestamp < 0
  ) {
    issues.push({
      code: "INVALID_TIMESTAMP",
      message: "Replay frame has an invalid timestamp.",
      frameIndex: expectedIndex,
    });
  }

  return issues;
}

export function validateMatchReplay(
  replay: MatchReplay,
): ReplayValidationResult {
  const issues: ReplayValidationIssue[] = [];

  if (!replay.matchId.trim()) {
    issues.push({
      code: "MISSING_MATCH_ID",
      message: "Replay must have a match ID.",
    });
  }

  if (replay.totalFrames !== replay.frames.length) {
    issues.push({
      code: "FRAME_COUNT_MISMATCH",
      message: "Replay frame count does not match its frame array.",
    });
  }

  if (
    !Number.isFinite(replay.durationMs) ||
    replay.durationMs < 0
  ) {
    issues.push({
      code: "INVALID_DURATION",
      message: "Replay duration must be a non-negative number.",
    });
  }

  let previousTimestamp = -1;

  replay.frames.forEach((frame, index) => {
    issues.push(...validateReplayFrame(frame, index));

    if (
      Number.isFinite(frame.timestamp) &&
      frame.timestamp < previousTimestamp
    ) {
      issues.push({
        code: "TIMESTAMP_ORDER_ERROR",
        message: "Replay timestamps must be chronological.",
        frameIndex: index,
      });
    }

    if (Number.isFinite(frame.timestamp)) {
      previousTimestamp = frame.timestamp;
    }
  });

  return {
    isValid: issues.length === 0,
    checkedFrames: replay.frames.length,
    issues,
  };
}
