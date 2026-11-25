
import type {
  MatchRules,
  InningsProgress,
  DeliveryDecision,
} from "./matchRulesEngine";

import {
  DEFAULT_MATCH_RULES,
  createInningsProgress,
  applyDeliveryToProgress,
} from "./matchRulesEngine";

export interface MatchTeam {
  id: string;
  name: string;
  shortName: string;
  players: string[];
}

export interface BatterState {
  playerId: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
}

export interface PartnershipState {
  batterOneId: string;
  batterTwoId: string;
  runs: number;
  balls: number;
}

export interface MatchInningsState {
  battingTeamId: string;
  bowlingTeamId: string;
  progress: InningsProgress;
  batters: Record<string, BatterState>;
  strikerId: string;
  nonStrikerId: string;
  nextBatterIndex: number;
  battingOrder: string[];
  partnership: PartnershipState;
  target: number | null;
}

export type MatchStatus =
  | "scheduled"
  | "live"
  | "innings-break"
  | "completed";

export interface CricketMatchState {
  id: string;
  format: "T20" | "ODI" | "TEST";
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  innings: MatchInningsState[];
  currentInningsIndex: number;
  status: MatchStatus;
  winnerId: string | null;
  resultText: string | null;
  rules: MatchRules;
}

export interface DeliveryRecord {
  batterId: string;
  decision: DeliveryDecision;
}

function createBatterStates(
  players: string[],
): Record<string, BatterState> {
  const batters: Record<string, BatterState> = {};

  for (const playerId of players) {
    batters[playerId] = {
      playerId,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
    };
  }

  return batters;
}

function createPartnership(
  strikerId: string,
  nonStrikerId: string,
): PartnershipState {
  return {
    batterOneId: strikerId,
    batterTwoId: nonStrikerId,
    runs: 0,
    balls: 0,
  };
}

function createInningsState(
  battingTeam: MatchTeam,
  bowlingTeam: MatchTeam,
  target: number | null,
): MatchInningsState {
  if (battingTeam.players.length < 2) {
    throw new Error("A batting team needs at least two players.");
  }

  return {
    battingTeamId: battingTeam.id,
    bowlingTeamId: bowlingTeam.id,
    progress: createInningsProgress(),
    batters: createBatterStates(battingTeam.players),
    strikerId: battingTeam.players[0],
    nonStrikerId: battingTeam.players[1],
    nextBatterIndex: 2,
    battingOrder: [...battingTeam.players],
    partnership: createPartnership(
      battingTeam.players[0],
      battingTeam.players[1],
    ),
    target,
  };
}

function getCurrentInnings(
  match: CricketMatchState,
): MatchInningsState {
  const innings = match.innings[match.currentInningsIndex];

  if (!innings) {
    throw new Error("Current innings does not exist.");
  }

  return innings;
}

function swapStrike(innings: MatchInningsState): void {
  const currentStriker = innings.strikerId;

  innings.strikerId = innings.nonStrikerId;
  innings.nonStrikerId = currentStriker;
}

function addBatter(
  innings: MatchInningsState,
): string | null {
  while (innings.nextBatterIndex < innings.battingOrder.length) {
    const playerId =
      innings.battingOrder[innings.nextBatterIndex];

    innings.nextBatterIndex += 1;

    const batter = innings.batters[playerId];

    if (batter && !batter.isOut) {
      innings.strikerId = playerId;

      innings.partnership = createPartnership(
        playerId,
        innings.nonStrikerId,
      );

      return playerId;
    }
  }

  innings.strikerId = "";

  return null;
}

function completeInnings(
  match: CricketMatchState,
): void {
  if (match.currentInningsIndex === 0) {
    const firstInnings = match.innings[0];

    match.innings.push(
      createInningsState(
        match.awayTeam.id === firstInnings.battingTeamId
          ? match.homeTeam
          : match.awayTeam,
        match.awayTeam.id === firstInnings.bowlingTeamId
          ? match.homeTeam
          : match.awayTeam,
        firstInnings.progress.totalRuns + 1,
      ),
    );

    match.currentInningsIndex = 1;
    match.status = "innings-break";
    return;
  }

  const first = match.innings[0];
  const second = match.innings[1];

  if (second.progress.totalRuns >= (second.target ?? Infinity)) {
    match.winnerId = second.battingTeamId;
    match.resultText = `${second.battingTeamId} won the match.`;
  } else if (
    second.progress.totalRuns === first.progress.totalRuns
  ) {
    match.resultText = "The match is tied.";
  } else {
    match.winnerId = first.battingTeamId;
    const margin =
      first.progress.totalRuns - second.progress.totalRuns;

    match.resultText =
      `${first.battingTeamId} won by ${margin} runs.`;
  }

  match.status = "completed";
}

export function createCricketMatch(
  id: string,
  homeTeam: MatchTeam,
  awayTeam: MatchTeam,
  tossWinnerId: string,
  tossDecision: "bat" | "bowl",
  format: "T20" | "ODI" | "TEST" = "T20",
): CricketMatchState {
  if (!id.trim()) {
    throw new Error("Match ID is required.");
  }

  if (homeTeam.id === awayTeam.id) {
    throw new Error("A team cannot play against itself.");
  }

  if (
    !homeTeam.id ||
    !awayTeam.id ||
    homeTeam.players.length < 2 ||
    awayTeam.players.length < 2
  ) {
    throw new Error("Both teams need valid IDs and at least two players.");
  }

  if (
    new Set(homeTeam.players).size !== homeTeam.players.length ||
    new Set(awayTeam.players).size !== awayTeam.players.length
  ) {
    throw new Error("A team cannot contain duplicate player IDs.");
  }

  if (tossWinnerId !== homeTeam.id && tossWinnerId !== awayTeam.id) {
    throw new Error("Toss winner must be one of the match teams.");
  }

  const tossLoser =
    tossWinnerId === homeTeam.id ? awayTeam : homeTeam;

  const tossWinner =
    tossWinnerId === homeTeam.id ? homeTeam : awayTeam;

  const battingTeam =
    tossDecision === "bat" ? tossWinner : tossLoser;

  const bowlingTeam =
    tossDecision === "bat" ? tossLoser : tossWinner;

  return {
    id,
    format,
    homeTeam,
    awayTeam,
    innings: [
      createInningsState(
        battingTeam,
        bowlingTeam,
        null,
      ),
    ],
    currentInningsIndex: 0,
    status: "live",
    winnerId: null,
    resultText: null,
    rules: DEFAULT_MATCH_RULES[format],
  };
}

export function recordMatchDelivery(
  match: CricketMatchState,
  record: DeliveryRecord,
): CricketMatchState {
  if (match.status !== "live") {
    throw new Error("Match is not currently live.");
  }

  const next: CricketMatchState = {
    ...match,
    innings: match.innings.map((innings) => ({
      ...innings,
      progress: { ...innings.progress },
      batters: Object.fromEntries(
        Object.entries(innings.batters).map(([id, batter]) => [
          id,
          { ...batter },
        ]),
      ),
      partnership: { ...innings.partnership },
      battingOrder: [...innings.battingOrder],
    })),
  };

  const innings = getCurrentInnings(next);
  const decision = record.decision;

  if (record.batterId !== innings.strikerId) {
    throw new Error("Delivery batter must be the current striker.");
  }

  if (innings.progress.isComplete) {
    throw new Error("The innings is already complete.");
  }

  if (decision.totalRuns < 0 || !Number.isInteger(decision.totalRuns)) {
    throw new Error("Invalid delivery runs.");
  }

  const batter = innings.batters[record.batterId];

  if (!batter || batter.isOut) {
    throw new Error("Invalid or dismissed batter.");
  }

  batter.runs += decision.batterRuns;

  if (
    decision.isLegalDelivery ||
    decision.extraType === "no-ball"
  ) {
    batter.ballsFaced += 1;
  }

  if (decision.batterRuns === 4) batter.fours += 1;
  if (decision.batterRuns === 6) batter.sixes += 1;

  innings.partnership.runs += decision.totalRuns;
  innings.partnership.balls += decision.isLegalDelivery ? 1 : 0;

  innings.progress = applyDeliveryToProgress(
    innings.progress,
    decision,
    next.rules,
  );

  if (decision.isWicket) {
    batter.isOut = true;
    addBatter(innings);
  }

  if (decision.totalRuns % 2 === 1) {
    swapStrike(innings);
  }

  if (
    decision.isLegalDelivery &&
    innings.progress.ballsInCurrentOver === 0
  ) {
    swapStrike(innings);
  }

  if (
    innings.target !== null &&
    innings.progress.totalRuns >= innings.target
  ) {
    const runsNeededToWin =
      innings.target - 1;

    next.winnerId =
      innings.progress.totalRuns > runsNeededToWin
        ? innings.battingTeamId
        : null;

    next.resultText = `${innings.battingTeamId} won the match.`;
    next.status = "completed";
    return next;
  }

  if (
    innings.progress.isComplete ||
    innings.strikerId === ""
  ) {
    completeInnings(next);
  }

  return next;
}

export function getMatchScore(
  match: CricketMatchState,
): string {
  const innings = getCurrentInnings(match);

  return `${innings.progress.totalRuns}/${innings.progress.wickets}`;
}

export function getCurrentBatters(
  match: CricketMatchState,
): BatterState[] {
  const innings = getCurrentInnings(match);

  return [
    innings.batters[innings.strikerId],
    innings.batters[innings.nonStrikerId],
  ].filter(
    (batter): batter is BatterState => Boolean(batter),
  );
}

export function getMatchResult(
  match: CricketMatchState,
): string {
  return match.resultText ?? "Match in progress.";
}
