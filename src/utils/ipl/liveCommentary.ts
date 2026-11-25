
import {
  matchEventBus,
  type MatchEvent,
  type MatchEventSubscription,
} from "./matchEventBus";

export interface LiveCommentaryEntry {
  id: string;
  matchId: string;
  eventType: MatchEvent["type"];
  message: string;
  timestamp: number;
}

export interface LiveCommentaryOptions {
  maximumEntries?: number;
  onCommentary?: (entry: LiveCommentaryEntry) => void;
}

function getPayloadText(
  payload: unknown,
  key: string,
): string | undefined {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !(key in payload)
  ) {
    return undefined;
  }

  const value = (payload as Record<string, unknown>)[key];

  return typeof value === "string" ||
    typeof value === "number"
    ? String(value)
    : undefined;
}

function createCommentaryMessage(
  event: MatchEvent,
): string {
  const batter = getPayloadText(event.payload, "batterName");
  const runs = getPayloadText(event.payload, "runs");
  const player = getPayloadText(event.payload, "playerName");
  const over = getPayloadText(event.payload, "over");

  switch (event.type) {
    case "match-started":
      return "The match is underway!";

    case "innings-started":
      return "The next innings is about to begin.";

    case "delivery-completed":
      return runs !== undefined
        ? `${batter ?? "The batter"} scores ${runs} run(s).`
        : "The delivery has been completed.";

    case "boundary-scored":
      return runs === "6"
        ? `${batter ?? "The batter"} launches it for six!`
        : `${batter ?? "The batter"} finds the boundary!`;

    case "wicket-fallen":
      return `${player ?? "A batter"} is dismissed!`;

    case "over-completed":
      return over !== undefined
        ? `End of over ${over}.`
        : "The over is complete.";

    case "innings-completed":
      return "The innings has come to an end.";

    case "weather-changed":
      return "The weather conditions have changed.";

    case "rain-interruption":
      return "Play has been interrupted by rain.";

    case "match-resumed":
      return "Play resumes after the interruption.";

    case "match-abandoned":
      return "The match has been abandoned.";

    case "match-completed":
      return "The match is over!";

    default:
      return "A new match event has occurred.";
  }
}

export class LiveCommentaryFeed {
  private entries: LiveCommentaryEntry[] = [];
  private subscriptions: MatchEventSubscription[] = [];
  private readonly maximumEntries: number;

  constructor(
    private readonly matchId: string,
    private readonly options: LiveCommentaryOptions = {},
  ) {
    if (!matchId.trim()) {
      throw new Error("Match ID is required.");
    }

    this.maximumEntries = options.maximumEntries ?? 100;

    if (
      !Number.isInteger(this.maximumEntries) ||
      this.maximumEntries < 1
    ) {
      throw new Error("Maximum entries must be a positive integer.");
    }

    this.connect();
  }

  private connect(): void {
    const eventTypes: MatchEvent["type"][] = [
      "match-started",
      "innings-started",
      "delivery-completed",
      "boundary-scored",
      "wicket-fallen",
      "over-completed",
      "innings-completed",
      "weather-changed",
      "rain-interruption",
      "match-resumed",
      "match-abandoned",
      "match-completed",
    ];

    this.subscriptions = eventTypes.map((type) =>
      matchEventBus.subscribe(type, (event) => {
        if (event.matchId === this.matchId) {
          this.addEvent(event);
        }
      }),
    );
  }

  private addEvent(event: MatchEvent): void {
    const entry: LiveCommentaryEntry = {
      id: event.eventId,
      matchId: event.matchId,
      eventType: event.type,
      message: createCommentaryMessage(event),
      timestamp: event.timestamp,
    };

    this.entries.push(entry);

    if (this.entries.length > this.maximumEntries) {
      this.entries.splice(
        0,
        this.entries.length - this.maximumEntries,
      );
    }

    this.options.onCommentary?.(entry);
  }

  getEntries(): LiveCommentaryEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }

  disconnect(): void {
    this.subscriptions.forEach((subscription) =>
      subscription.unsubscribe(),
    );

    this.subscriptions = [];
  }
}

export function createLiveCommentaryFeed(
  matchId: string,
  options?: LiveCommentaryOptions,
): LiveCommentaryFeed {
  return new LiveCommentaryFeed(matchId, options);
}
