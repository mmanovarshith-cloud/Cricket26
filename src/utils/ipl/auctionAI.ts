
import type {
  AuctionPlayer,
  AuctionLot,
  FranchiseAuctionState,
} from "./auctionEngine";

export type AuctionPersonality =
  | "aggressive"
  | "balanced"
  | "conservative"
  | "strategic";

export interface AuctionAIProfile {
  franchiseId: string;
  personality: AuctionPersonality;
  aggression: number;
  riskTolerance: number;
  preferredRoles: string[];
}

export interface AuctionAIDecision {
  shouldBid: boolean;
  bidAmount: number;
  confidence: number;
  reasoning: string;
}

export interface AuctionAIContext {
  player: AuctionPlayer;
  lot: AuctionLot;
  franchise: FranchiseAuctionState;
  profile: AuctionAIProfile;
  minimumIncrement: number;
}

const PERSONALITY_MULTIPLIERS: Record<
  AuctionPersonality,
  number
> = {
  aggressive: 1.3,
  balanced: 1.0,
  conservative: 0.75,
  strategic: 1.1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getRoleBonus(
  player: AuctionPlayer,
  profile: AuctionAIProfile,
): number {
  return profile.preferredRoles.some(
    (role) => role.toLowerCase() === player.role.toLowerCase(),
  )
    ? 12
    : 0;
}

function getPlayerValue(
  player: AuctionPlayer,
  profile: AuctionAIProfile,
): number {
  const rating = clamp(player.rating, 1, 100);
  const personalityMultiplier =
    PERSONALITY_MULTIPLIERS[profile.personality];

  const roleBonus = getRoleBonus(player, profile);

  return (
    (rating * 2.2 + roleBonus) *
    personalityMultiplier
  );
}

function getMaximumBid(
  player: AuctionPlayer,
  franchise: FranchiseAuctionState,
  profile: AuctionAIProfile,
): number {
  const playerValue = getPlayerValue(player, profile);

  const risk = clamp(profile.riskTolerance, 0, 100) / 100;
  const aggression = clamp(profile.aggression, 0, 100) / 100;

  const biddingMultiplier =
    0.65 + risk * 0.4 + aggression * 0.3;

  const maximumByValue = Math.round(
    playerValue * biddingMultiplier,
  );

  return Math.min(
    maximumByValue,
    franchise.purseRemaining,
  );
}

export function evaluateAuctionPlayer(
  context: AuctionAIContext,
): AuctionAIDecision {
  const {
    player,
    lot,
    franchise,
    profile,
    minimumIncrement,
  } = context;

  const noBid: AuctionAIDecision = {
    shouldBid: false,
    bidAmount: 0,
    confidence: 0,
    reasoning: "",
  };

  if (lot.status !== "live") {
    return {
      ...noBid,
      reasoning: "Auction lot is not live.",
    };
  }

  if (lot.highestBidderId === franchise.franchiseId) {
    return {
      ...noBid,
      reasoning: "Franchise already holds the highest bid.",
    };
  }

  const maximumBid = getMaximumBid(
    player,
    franchise,
    profile,
  );

  const nextBid =
    lot.highestBidderId === null
      ? player.basePrice
      : lot.currentBid + minimumIncrement;

  if (nextBid > maximumBid) {
    return {
      ...noBid,
      reasoning: "Player price exceeds the franchise valuation.",
    };
  }

  if (nextBid > franchise.purseRemaining) {
    return {
      ...noBid,
      reasoning: "Insufficient remaining purse.",
    };
  }

  const confidence = clamp(
    Math.round(
      player.rating * 0.55 +
      profile.aggression * 0.2 +
      profile.riskTolerance * 0.25,
    ),
    0,
    100,
  );

  return {
    shouldBid: true,
    bidAmount: nextBid,
    confidence,
    reasoning:
      profile.preferredRoles.some(
        (role) => role.toLowerCase() === player.role.toLowerCase(),
      )
        ? "Player matches the franchise's preferred role."
        : "Player fits the franchise's current valuation.",
  };
}

export function createDefaultAuctionAIProfiles(
  franchiseIds: readonly string[],
): AuctionAIProfile[] {
  const personalities: AuctionPersonality[] = [
    "aggressive",
    "balanced",
    "strategic",
    "conservative",
    "balanced",
    "aggressive",
    "strategic",
    "conservative",
    "balanced",
    "strategic",
  ];

  const rolePreferences = [
    ["Batter", "All-Rounder"],
    ["Bowler", "All-Rounder"],
    ["Wicket-Keeper", "Batter"],
    ["All-Rounder", "Bowler"],
    ["Batter", "Bowler"],
    ["Wicket-Keeper", "All-Rounder"],
    ["Bowler", "Batter"],
    ["All-Rounder", "Wicket-Keeper"],
    ["Batter", "All-Rounder"],
    ["Bowler", "All-Rounder"],
  ];

  return franchiseIds.map((franchiseId, index) => ({
    franchiseId,
    personality: personalities[index % personalities.length],
    aggression: 35 + ((index * 13) % 60),
    riskTolerance: 30 + ((index * 17) % 65),
    preferredRoles: rolePreferences[
      index % rolePreferences.length
    ],
  }));
}
