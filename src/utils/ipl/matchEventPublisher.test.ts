
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  publishMatchStarted,
  publishInningsStarted,
  publishDeliveryCompleted,
  publishInningsCompleted,
  publishMatchCompleted,
} from "./matchEventPublisher";

import { matchEventBus } from "./matchEventBus";

describe("Match Event Publisher", () => {
  beforeEach(() => {
    matchEventBus.clearHistory();
    matchEventBus.clearListeners();
  });

  it("publishes a match-started event", () => {
    publishMatchStarted("match-1", "T20", 20);

    const events = matchEventBus.getHistory("match-1");

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("match-started");
  });

  it("publishes innings information", () => {
    publishInningsStarted("match-2", {
      innings: 1,
      battingTeam: "Team A",
      bowlingTeam: "Team B",
    });

    const events = matchEventBus.getHistory("match-2");

    expect(events[0].type).toBe("innings-started");
  });

  it("publishes a completed delivery", () => {
    publishDeliveryCompleted("match-3", {
      batterId: "batter-1",
      batterName: "Batter One",
      bowlerId: "bowler-1",
      bowlerName: "Bowler One",
      batterRuns: 4,
      totalRuns: 4,
      extraRuns: 0,
      legalDelivery: true,
      isFour: true,
      isSix: false,
      isWicket: false,
      isWide: false,
      isNoBall: false,
    });

    const events = matchEventBus.getHistory("match-3");

    expect(events).toHaveLength(2);
    expect(events[0].type).toBe("delivery-completed");
    expect(events[1].type).toBe("boundary-scored");
  });

  it("publishes a wicket event", () => {
    publishDeliveryCompleted("match-4", {
      batterId: "batter-2",
      batterName: "Batter Two",
      bowlerId: "bowler-2",
      bowlerName: "Bowler Two",
      batterRuns: 0,
      totalRuns: 0,
      extraRuns: 0,
      legalDelivery: true,
      isFour: false,
      isSix: false,
      isWicket: true,
      isWide: false,
      isNoBall: false,
      wicketType: "bowled",
    });

    const events = matchEventBus.getHistory("match-4");

    expect(events).toHaveLength(2);
    expect(events[1].type).toBe("wicket-fallen");
  });

  it("rejects invalid delivery data", () => {
    expect(() =>
      publishDeliveryCompleted("match-5", {
        batterId: "batter-1",
        batterName: "Batter One",
        bowlerId: "bowler-1",
        bowlerName: "Bowler One",
        batterRuns: -1,
        totalRuns: 0,
        extraRuns: 0,
        legalDelivery: true,
        isFour: false,
        isSix: false,
        isWicket: false,
        isWide: false,
        isNoBall: false,
      }),
    ).toThrow();
  });

  it("publishes innings completion", () => {
    publishInningsCompleted("match-6", {
      innings: 1,
      totalRuns: 175,
      wickets: 6,
      legalBalls: 120,
      target: 176,
    });

    const events = matchEventBus.getHistory("match-6");

    expect(events[0].type).toBe("innings-completed");
  });

  it("publishes the final match result", () => {
    publishMatchCompleted(
      "match-7",
      "Team A",
      "Won by 5 wickets",
    );

    const events = matchEventBus.getHistory("match-7");

    expect(events[0].type).toBe("match-completed");
  });

  it("notifies subscribers when an event is published", () => {
    const listener = vi.fn();

    const subscription = matchEventBus.subscribe(
      "match-started",
      listener,
    );

    publishMatchStarted("match-8", "T20", 20);

    expect(listener).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();
  });
});
