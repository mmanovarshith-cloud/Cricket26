
import {
  createLiveScoreboard,
  type LiveScoreboardEngine,
} from "./liveScoreboardEngine";

import {
  createLiveCommentaryFeed,
  type LiveCommentaryFeed,
} from "./liveCommentary";

import {
  createLiveMatchStatistics,
  type LiveMatchStatisticsEngine,
} from "./liveMatchStatisticsEngine";

import {
  matchEventBus,
  type MatchEvent,
  type MatchEventSubscription,
} from "./matchEventBus";

export interface LiveMatchControllerOptions {
  matchId: string;
  battingTeam: string;
  bowlingTeam: string;
  commentaryLimit?: number;
  onEvent?: (event: MatchEvent) => void;
}

export class LiveMatchController {
  readonly scoreboard: LiveScoreboardEngine;
  readonly commentary: LiveCommentaryFeed;
  readonly statistics: LiveMatchStatisticsEngine;

  private eventSubscription: MatchEventSubscription;
  private disposed = false;

  constructor(options: LiveMatchControllerOptions) {
    if (!options.matchId.trim()) {
      throw new Error("Match ID is required.");
    }

    if (
      !options.battingTeam.trim() ||
      !options.bowlingTeam.trim()
    ) {
      throw new Error("Both team names are required.");
    }

    this.scoreboard = createLiveScoreboard(
      options.matchId,
      options.battingTeam,
      options.bowlingTeam,
    );

    this.commentary = createLiveCommentaryFeed(
      options.matchId,
      {
        maximumEntries: options.commentaryLimit ?? 100,
      },
    );

    this.statistics = createLiveMatchStatistics(
      options.matchId,
    );

    this.eventSubscription = matchEventBus.subscribe(
      "match-started",
      (event) => {
        if (event.matchId === options.matchId) {
          options.onEvent?.(event);
        }
      },
    );

    this.allEventSubscription = this.subscribeToAllEvents(
      options.matchId,
      options.onEvent,
    );
  }

  private allEventSubscription: MatchEventSubscription;

  private subscribeToAllEvents(
    matchId: string,
    callback?: (event: MatchEvent) => void,
  ): MatchEventSubscription {
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

    const subscriptions = eventTypes.map((type) =>
      matchEventBus.subscribe(type, (event) => {
        if (event.matchId === matchId) {
          callback?.(event);
        }
      }),
    );

    return {
      unsubscribe: () => {
        subscriptions.forEach((subscription) =>
          subscription.unsubscribe(),
        );
      },
    };
  }

  getSnapshot() {
    return {
      scoreboard: this.scoreboard.getState(),
      overs: this.scoreboard.getOversDisplay(),
      commentary: this.commentary.getEntries(),
      statistics: this.statistics.getStatistics(),
    };
  }

  dispose(): void {
    if (this.disposed) return;

    this.scoreboard.disconnect();
    this.commentary.disconnect();
    this.statistics.disconnect();
    this.eventSubscription.unsubscribe();
    this.allEventSubscription.unsubscribe();

    this.disposed = true;
  }
}

export function createLiveMatchController(
  options: LiveMatchControllerOptions,
): LiveMatchController {
  return new LiveMatchController(options);
}
