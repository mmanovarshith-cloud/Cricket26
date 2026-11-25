
export type MatchEventType =
  | "match-started"
  | "innings-started"
  | "delivery-completed"
  | "boundary-scored"
  | "wicket-fallen"
  | "over-completed"
  | "innings-completed"
  | "weather-changed"
  | "rain-interruption"
  | "match-resumed"
  | "match-abandoned"
  | "match-completed";

export interface MatchEvent<TPayload = unknown> {
  eventId: string;
  matchId: string;
  type: MatchEventType;
  payload: TPayload;
  timestamp: number;
}

export type MatchEventListener = (
  event: MatchEvent,
) => void;

export interface MatchEventSubscription {
  unsubscribe: () => void;
}

export class MatchEventBus {
  private listeners = new Map<
    MatchEventType,
    Set<MatchEventListener>
  >();

  private eventHistory: MatchEvent[] = [];

  constructor(
    private readonly maximumHistory = 500,
  ) {
    if (
      !Number.isInteger(maximumHistory) ||
      maximumHistory < 1
    ) {
      throw new Error("Maximum event history must be positive.");
    }
  }

  subscribe(
    type: MatchEventType,
    listener: MatchEventListener,
  ): MatchEventSubscription {
    if (typeof listener !== "function") {
      throw new Error("Event listener must be a function.");
    }

    const existing = this.listeners.get(type) ??
      new Set<MatchEventListener>();

    existing.add(listener);
    this.listeners.set(type, existing);

    return {
      unsubscribe: () => {
        existing.delete(listener);

        if (existing.size === 0) {
          this.listeners.delete(type);
        }
      },
    };
  }

  publish<TPayload>(
    matchId: string,
    type: MatchEventType,
    payload: TPayload,
  ): MatchEvent<TPayload> {
    if (!matchId.trim()) {
      throw new Error("Match ID is required.");
    }

    const event: MatchEvent<TPayload> = {
      eventId: `event-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      matchId,
      type,
      payload,
      timestamp: Date.now(),
    };

    this.eventHistory.push(event);

    if (this.eventHistory.length > this.maximumHistory) {
      this.eventHistory.splice(
        0,
        this.eventHistory.length - this.maximumHistory,
      );
    }

    const listeners = [
      ...(this.listeners.get(type) ?? []),
    ];

    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        // One subscriber must not prevent other subscribers
        // from receiving the same match event.
        console.error("Match event listener failed:", error);
      }
    }

    return event;
  }

  getHistory(matchId?: string): MatchEvent[] {
    const history = matchId
      ? this.eventHistory.filter(
          (event) => event.matchId === matchId,
        )
      : this.eventHistory;

    return [...history];
  }

  clearHistory(matchId?: string): void {
    if (!matchId) {
      this.eventHistory = [];
      return;
    }

    this.eventHistory = this.eventHistory.filter(
      (event) => event.matchId !== matchId,
    );
  }

  clearListeners(): void {
    this.listeners.clear();
  }
}

export const matchEventBus = new MatchEventBus();
