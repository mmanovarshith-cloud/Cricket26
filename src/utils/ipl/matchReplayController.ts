
import {
  getReplayFrame,
  type MatchReplay,
  type ReplayFrame,
} from "./matchReplayEngine";

export type ReplayPlaybackStatus =
  | "stopped"
  | "playing"
  | "paused"
  | "completed";

export interface ReplayControllerState {
  status: ReplayPlaybackStatus;
  currentFrameIndex: number;
  playbackSpeed: number;
  totalFrames: number;
}

export class MatchReplayController {
  private replay: MatchReplay;
  private currentFrameIndex = 0;
  private playbackSpeed = 1;
  private status: ReplayPlaybackStatus = "stopped";

  constructor(replay: MatchReplay) {
    this.replay = replay;
  }

  getState(): ReplayControllerState {
    return {
      status: this.status,
      currentFrameIndex: this.currentFrameIndex,
      playbackSpeed: this.playbackSpeed,
      totalFrames: this.replay.totalFrames,
    };
  }

  play(): void {
    if (this.replay.totalFrames === 0) {
      this.status = "completed";
      return;
    }

    if (this.currentFrameIndex >= this.replay.totalFrames - 1) {
      this.currentFrameIndex = 0;
    }

    this.status = "playing";
  }

  pause(): void {
    if (this.status === "playing") {
      this.status = "paused";
    }
  }

  reset(): void {
    this.currentFrameIndex = 0;
    this.status = "stopped";
  }

  setSpeed(speed: number): void {
    if (!Number.isFinite(speed) || speed <= 0 || speed > 8) {
      throw new Error("Playback speed must be greater than 0 and at most 8.");
    }

    this.playbackSpeed = speed;
  }

  nextFrame(): ReplayFrame | null {
    if (this.currentFrameIndex >= this.replay.totalFrames - 1) {
      this.status = "completed";
      return this.getCurrentFrame();
    }

    this.currentFrameIndex++;

    return this.getCurrentFrame();
  }

  previousFrame(): ReplayFrame | null {
    this.currentFrameIndex = Math.max(
      0,
      this.currentFrameIndex - 1,
    );

    if (this.status === "completed") {
      this.status = "paused";
    }

    return this.getCurrentFrame();
  }

  seek(frameIndex: number): ReplayFrame | null {
    if (
      !Number.isInteger(frameIndex) ||
      frameIndex < 0 ||
      frameIndex >= this.replay.totalFrames
    ) {
      return null;
    }

    this.currentFrameIndex = frameIndex;

    if (this.status === "completed") {
      this.status = "paused";
    }

    return this.getCurrentFrame();
  }

  getCurrentFrame(): ReplayFrame | null {
    return getReplayFrame(
      this.replay,
      this.currentFrameIndex,
    );
  }

  getProgress(): number {
    if (this.replay.totalFrames <= 1) {
      return this.replay.totalFrames === 1 ? 100 : 0;
    }

    return (
      (this.currentFrameIndex /
        (this.replay.totalFrames - 1)) *
      100
    );
  }
}
