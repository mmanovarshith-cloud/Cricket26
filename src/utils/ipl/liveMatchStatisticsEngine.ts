
import {
  matchEventBus,
  type MatchEvent,
  type MatchEventSubscription,
} from "./matchEventBus";

export interface LiveBatterStatistics {
  playerId: string;
  playerName: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
}

export interface LiveBowlerStatistics {
  playerId: string;
  playerName: string;
  legalBalls: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
}

export interface LiveMatchStatistics {
  matchId: string;
  batters: LiveBatterStatistics[];
  bowlers: LiveBowlerStatistics[];
  totalFours: number;
  totalSixes: number;
  totalWickets: number;
  totalExtras: number;
}

export interface LiveDeliveryStatistics {
  batterId: string;
  batterName: string;
  bowlerId: string;
  bowlerName: string;
  batterRuns: number;
  totalRuns: number;
  legalDelivery: boolean;
  isFour: boolean;
  isSix: boolean;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;
  extraRuns: number;
}

export class LiveMatchStatisticsEngine {
  private statistics: LiveMatchStatistics;
  private subscriptions: MatchEventSubscription[] = [];

  constructor(matchId: string) {
    if (!matchId.trim()) {
      throw new Error("Match ID is required.");
    }

    this.statistics = {
      matchId,
      batters: [],
      bowlers: [],
      totalFours: 0,
      totalSixes: 0,
      totalWickets: 0,
      totalExtras: 0,
    };

    this.connect();
  }

  private connect(): void {
    this.subscriptions.push(
      matchEventBus.subscribe(
        "delivery-completed",
        (event) => {
          if (event.matchId === this.statistics.matchId) {
            this.recordDelivery(event);
          }
        },
      ),
    );
  }

  private recordDelivery(event: MatchEvent): void {
    const payload = event.payload as Partial<LiveDeliveryStatistics>;

    if (
      !payload.batterId ||
      !payload.batterName ||
      !payload.bowlerId ||
      !payload.bowlerName
    ) {
      return;
    }

    const batterRuns = Math.max(0, payload.batterRuns ?? 0);
    const totalRuns = Math.max(0, payload.totalRuns ?? 0);
    const extraRuns = Math.max(0, payload.extraRuns ?? 0);

    let batter = this.statistics.batters.find(
      (item) => item.playerId === payload.batterId,
    );

    if (!batter) {
      batter = {
        playerId: payload.batterId,
        playerName: payload.batterName,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
      };

      this.statistics.batters.push(batter);
    }

    let bowler = this.statistics.bowlers.find(
      (item) => item.playerId === payload.bowlerId,
    );

    if (!bowler) {
      bowler = {
        playerId: payload.bowlerId,
        playerName: payload.bowlerName,
        legalBalls: 0,
        runsConceded: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
      };

      this.statistics.bowlers.push(bowler);
    }

    if (payload.legalDelivery !== false) {
      batter.ballsFaced += 1;
      bowler.legalBalls += 1;
    }

    batter.runs += batterRuns;
    bowler.runsConceded += totalRuns - extraRuns;

    if (payload.isFour) {
      batter.fours += 1;
      this.statistics.totalFours += 1;
    }

    if (payload.isSix) {
      batter.sixes += 1;
      this.statistics.totalSixes += 1;
    }

    if (payload.isWicket) {
      batter.isOut = true;
      bowler.wickets += 1;
      this.statistics.totalWickets += 1;
    }

    if (payload.isWide) {
      bowler.wides += 1;
    }

    if (payload.isNoBall) {
      bowler.noBalls += 1;
    }

    this.statistics.totalExtras += extraRuns;
  }

  getStatistics(): LiveMatchStatistics {
    return {
      ...this.statistics,
      batters: this.statistics.batters.map((item) => ({ ...item })),
      bowlers: this.statistics.bowlers.map((item) => ({ ...item })),
    };
  }

  disconnect(): void {
    this.subscriptions.forEach((subscription) =>
      subscription.unsubscribe(),
    );

    this.subscriptions = [];
  }
}

export function createLiveMatchStatistics(
  matchId: string,
): LiveMatchStatisticsEngine {
  return new LiveMatchStatisticsEngine(matchId);
}
