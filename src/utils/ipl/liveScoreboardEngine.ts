
import {
  matchEventBus,
  type MatchEvent,
  type MatchEventSubscription,
} from "./matchEventBus";

export interface LiveScoreboardState {
  matchId: string;
  innings: number;
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  legalBalls: number;
  target: number | null;
  currentRunRate: number;
  requiredRunRate: number | null;
  status: "waiting" | "live" | "innings-break" | "completed";
}

export interface ScoreboardDelivery {
  runs?: number;
  batterRuns?: number;
  extraRuns?: number;
  isLegalDelivery?: boolean;
  isWicket?: boolean;
}

function getNumber(
  payload: unknown,
  key: string,
): number | undefined {
  if (
    typeof payload !== "object" ||
    payload === null
  ) {
    return undefined;
  }

  const value = (payload as Record<string, unknown>)[key];

  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getString(
  payload: unknown,
  key: string,
): string | undefined {
  if (
    typeof payload !== "object" ||
    payload === null
  ) {
    return undefined;
  }

  const value = (payload as Record<string, unknown>)[key];

  return typeof value === "string" ? value : undefined;
}

export class LiveScoreboardEngine {
  private state: LiveScoreboardState;
  private subscriptions: MatchEventSubscription[] = [];

  constructor(
    matchId: string,
    battingTeam = "Team A",
    bowlingTeam = "Team B",
  ) {
    if (!matchId.trim()) {
      throw new Error("Match ID is required.");
    }

    this.state = {
      matchId,
      innings: 1,
      battingTeam,
      bowlingTeam,
      runs: 0,
      wickets: 0,
      legalBalls: 0,
      target: null,
      currentRunRate: 0,
      requiredRunRate: null,
      status: "waiting",
    };

    this.connect();
  }

  private connect(): void {
    const eventTypes: MatchEvent["type"][] = [
      "match-started",
      "innings-started",
      "delivery-completed",
      "wicket-fallen",
      "innings-completed",
      "match-completed",
    ];

    this.subscriptions = eventTypes.map((type) =>
      matchEventBus.subscribe(type, (event) => {
        if (event.matchId === this.state.matchId) {
          this.handleEvent(event);
        }
      }),
    );
  }

  private handleEvent(event: MatchEvent): void {
    switch (event.type) {
      case "match-started":
        this.state = {
          ...this.state,
          status: "live",
        };
        break;

      case "innings-started":
        this.startInnings(event.payload);
        break;

      case "delivery-completed":
        this.recordDelivery(event.payload);
        break;

      case "wicket-fallen":
        // Wickets should be supplied as part of the
        // delivery-completed payload to avoid double counting.
        break;

      case "innings-completed":
        this.completeInnings(event.payload);
        break;

      case "match-completed":
        this.state = {
          ...this.state,
          status: "completed",
        };
        break;
    }
  }

  private startInnings(payload: unknown): void {
    const innings = getNumber(payload, "innings");
    const battingTeam = getString(payload, "battingTeam");
    const bowlingTeam = getString(payload, "bowlingTeam");
    const target = getNumber(payload, "target");

    this.state = {
      ...this.state,
      innings: innings ?? this.state.innings,
      battingTeam: battingTeam ?? this.state.battingTeam,
      bowlingTeam: bowlingTeam ?? this.state.bowlingTeam,
      runs: 0,
      wickets: 0,
      legalBalls: 0,
      target: target ?? null,
      currentRunRate: 0,
      requiredRunRate: null,
      status: "live",
    };
  }

  private recordDelivery(payload: unknown): void {
    if (this.state.status !== "live") return;

    const runs = getNumber(payload, "runs") ?? 0;
    const isLegalDelivery =
      typeof payload === "object" &&
      payload !== null &&
      "isLegalDelivery" in payload
        ? Boolean(
            (payload as Record<string, unknown>).isLegalDelivery,
          )
        : true;

    const isWicket =
      typeof payload === "object" &&
      payload !== null &&
      "isWicket" in payload
        ? Boolean(
            (payload as Record<string, unknown>).isWicket,
          )
        : false;

    if (!Number.isInteger(runs) || runs < 0) return;

    const nextRuns = this.state.runs + runs;
    const nextWickets = Math.min(
      10,
      this.state.wickets + (isWicket ? 1 : 0),
    );

    const nextLegalBalls =
      this.state.legalBalls + (isLegalDelivery ? 1 : 0);

    const overs = nextLegalBalls / 6;
    const currentRunRate =
      overs > 0 ? nextRuns / overs : 0;

    const remainingRuns =
      this.state.target === null
        ? null
        : Math.max(0, this.state.target - nextRuns);

    const remainingBalls = Math.max(
      0,
      120 - nextLegalBalls,
    );

    const requiredRunRate =
      remainingRuns === null
        ? null
        : remainingBalls > 0
          ? (remainingRuns / remainingBalls) * 6
          : remainingRuns === 0
            ? 0
            : null;

    this.state = {
      ...this.state,
      runs: nextRuns,
      wickets: nextWickets,
      legalBalls: nextLegalBalls,
      currentRunRate: Number(currentRunRate.toFixed(2)),
      requiredRunRate:
        requiredRunRate === null
          ? null
          : Number(requiredRunRate.toFixed(2)),
    };
  }

  private completeInnings(payload: unknown): void {
    const target = getNumber(payload, "target");

    this.state = {
      ...this.state,
      target: target ?? this.state.target,
      status: "innings-break",
    };
  }

  getState(): LiveScoreboardState {
    return { ...this.state };
  }

  getOversDisplay(): string {
    const completedOvers = Math.floor(
      this.state.legalBalls / 6,
    );

    const remainingBalls = this.state.legalBalls % 6;

    return `${completedOvers}.${remainingBalls}`;
  }

  disconnect(): void {
    this.subscriptions.forEach((subscription) =>
      subscription.unsubscribe(),
    );

    this.subscriptions = [];
  }
}

export function createLiveScoreboard(
  matchId: string,
  battingTeam?: string,
  bowlingTeam?: string,
): LiveScoreboardEngine {
  return new LiveScoreboardEngine(
    matchId,
    battingTeam,
    bowlingTeam,
  );
}
