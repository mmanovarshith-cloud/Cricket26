
export type CommentaryEventType =
  | "dot"
  | "single"
  | "double"
  | "triple"
  | "four"
  | "six"
  | "wicket"
  | "wide"
  | "no-ball"
  | "partnership"
  | "milestone"
  | "over-complete"
  | "innings-complete";

export type CommentaryTone =
  | "neutral"
  | "excited"
  | "dramatic"
  | "analytical";

export interface CommentaryContext {
  batterName: string;
  bowlerName: string;
  runs: number;
  totalScore: number;
  wickets: number;
  over: number;
  ball: number;
  batterRuns: number;
  batterBalls: number;
  partnershipRuns: number;
  requiredRunRate?: number;
  currentRunRate?: number;
  isPowerplay: boolean;
  isDeathOvers: boolean;
}

export interface CommentaryEvent {
  id: string;
  type: CommentaryEventType;
  tone: CommentaryTone;
  text: string;
  timestamp: number;
  over: number;
  ball: number;
}

const COMMENTARY_TEMPLATES: Record<
  CommentaryEventType,
  string[]
> = {
  dot: [
    "{bowler} keeps it tight. No run.",
    "{batter} finds no scoring opportunity.",
    "Good control from {bowler}. Dot ball.",
  ],
  single: [
    "{batter} works it away for a single.",
    "Quick running. One run added.",
    "{batter} rotates the strike.",
  ],
  double: [
    "Good placement! They come back for two.",
    "{batter} finds the gap and takes two.",
    "Excellent running between the wickets.",
  ],
  triple: [
    "Three runs! Excellent awareness in the field.",
    "They push hard and complete three.",
  ],
  four: [
    "FOUR! Beautifully timed to the boundary!",
    "Cracked away! That races to the rope.",
    "A superb boundary from {batter}!",
  ],
  six: [
    "SIX! That's launched into the stands!",
    "Huge hit! Maximum for {batter}!",
    "Magnificent strike. Six runs!",
  ],
  wicket: [
    "OUT! {bowler} gets the breakthrough!",
    "A big moment! {batter} has to depart.",
    "Wicket falls! The bowling side celebrates.",
  ],
  wide: [
    "Too wide. An extra run to the batting side.",
    "{bowler} misses the line. Wide called.",
  ],
  "no-ball": [
    "No-ball! An extra delivery coming.",
    "Overstepping from {bowler}. No-ball.",
  ],
  partnership: [
    "The partnership reaches {partnershipRuns} runs.",
    "A valuable stand is developing here.",
  ],
  milestone: [
    "{batter} reaches a batting milestone!",
    "A memorable moment for {batter}.",
  ],
  "over-complete": [
    "End of the over. The fielding side regroups.",
    "Six legal deliveries completed.",
  ],
  "innings-complete": [
    "The innings comes to an end.",
    "That's the end of the batting innings.",
  ],
};

function selectTemplate(
  type: CommentaryEventType,
  randomValue: number,
): string {
  const templates = COMMENTARY_TEMPLATES[type];

  const index = Math.floor(randomValue * templates.length);

  return templates[index];
}

function getTone(type: CommentaryEventType): CommentaryTone {
  if (type === "six" || type === "four") return "excited";
  if (type === "wicket") return "dramatic";

  if (
    type === "dot" ||
    type === "over-complete" ||
    type === "partnership"
  ) {
    return "analytical";
  }

  return "neutral";
}

function replaceTokens(
  template: string,
  context: CommentaryContext,
): string {
  return template
    .replaceAll("{batter}", context.batterName)
    .replaceAll("{bowler}", context.bowlerName)
    .replaceAll(
      "{partnershipRuns}",
      String(context.partnershipRuns),
    );
}

export function generateCommentary(
  type: CommentaryEventType,
  context: CommentaryContext,
  randomValue = 0.5,
): CommentaryEvent {
  if (
    !Number.isFinite(randomValue) ||
    randomValue < 0 ||
    randomValue >= 1
  ) {
    throw new Error("Random value must be between 0 and 1.");
  }

  if (
    !Number.isInteger(context.runs) ||
    !Number.isInteger(context.totalScore) ||
    !Number.isInteger(context.wickets) ||
    !Number.isInteger(context.over) ||
    !Number.isInteger(context.ball) ||
    context.runs < 0 ||
    context.totalScore < 0 ||
    context.wickets < 0 ||
    context.wickets > 10 ||
    context.over < 0 ||
    context.ball < 0 ||
    context.ball > 6
  ) {
    throw new Error("Invalid commentary context.");
  }

  const template = selectTemplate(type, randomValue);
  const text = replaceTokens(template, context);

  return {
    id: `commentary-${Date.now()}-${Math.floor(randomValue * 100000)}`,
    type,
    tone: getTone(type),
    text,
    timestamp: Date.now(),
    over: context.over,
    ball: context.ball,
  };
}

export function inferCommentaryEvent(
  context: CommentaryContext,
  isWicket: boolean,
  extraType?: "wide" | "no-ball",
): CommentaryEventType {
  if (isWicket) return "wicket";
  if (extraType === "wide") return "wide";
  if (extraType === "no-ball") return "no-ball";

  if (context.runs >= 6) return "six";
  if (context.runs === 4) return "four";
  if (context.runs === 3) return "triple";
  if (context.runs === 2) return "double";
  if (context.runs === 1) return "single";

  return "dot";
}

export function generateOverSummary(
  events: CommentaryEvent[],
): string {
  const overEvents = events.filter(
    (event) => event.type !== "over-complete",
  );

  const runs = overEvents.reduce((total, event) => {
    if (
      event.type === "four" ||
      event.type === "six" ||
      event.type === "single" ||
      event.type === "double" ||
      event.type === "triple"
    ) {
      return total + (
        event.type === "four"
          ? 4
          : event.type === "six"
            ? 6
            : event.type === "single"
              ? 1
              : event.type === "double"
                ? 2
                : 3
      );
    }

    if (event.type === "wide" || event.type === "no-ball") {
      return total + 1;
    }

    return total;
  }, 0);

  const wickets = overEvents.filter(
    (event) => event.type === "wicket",
  ).length;

  return `Over summary: ${runs} runs, ${wickets} wicket(s).`;
}

export function getCommentaryFeed(
  events: CommentaryEvent[],
  limit = 20,
): CommentaryEvent[] {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Feed limit must be a positive integer.");
  }

  return [...events]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
