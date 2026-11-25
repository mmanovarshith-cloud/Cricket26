
export type ReputationTier =
  | "global-icon"
  | "elite"
  | "popular"
  | "established"
  | "developing"
  | "unknown";

export interface FranchiseReputation {
  franchiseId: string;
  reputation: number;
  fanLoyalty: number;
  popularity: number;
  communitySupport: number;
  internationalRecognition: number;
  totalFans: number;
  lastUpdated: number;
}

export interface ReputationEvent {
  type:
    | "tournament-win"
    | "final-appearance"
    | "playoff-qualification"
    | "star-player-signing"
    | "community-event"
    | "controversy"
    | "poor-season";
  magnitude?: number;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function validateScore(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${name} must be between 0 and 100.`);
  }
}

export function createFranchiseReputation(
  franchiseId: string,
  initialScore = 50,
  initialFans = 1_000_000,
): FranchiseReputation {
  if (!franchiseId.trim()) {
    throw new Error("Franchise ID is required.");
  }

  validateScore(initialScore, "Initial reputation");

  if (!Number.isSafeInteger(initialFans) || initialFans < 0) {
    throw new Error("Initial fan count must be a non-negative whole number.");
  }

  return {
    franchiseId,
    reputation: initialScore,
    fanLoyalty: initialScore,
    popularity: initialScore,
    communitySupport: initialScore,
    internationalRecognition: initialScore,
    totalFans: initialFans,
    lastUpdated: Date.now(),
  };
}

const EVENT_EFFECTS: Record<
  ReputationEvent["type"],
  {
    reputation: number;
    loyalty: number;
    popularity: number;
    community: number;
    international: number;
    fanGrowth: number;
  }
> = {
  "tournament-win": {
    reputation: 12,
    loyalty: 8,
    popularity: 12,
    community: 5,
    international: 10,
    fanGrowth: 0.12,
  },
  "final-appearance": {
    reputation: 7,
    loyalty: 5,
    popularity: 7,
    community: 3,
    international: 5,
    fanGrowth: 0.07,
  },
  "playoff-qualification": {
    reputation: 4,
    loyalty: 3,
    popularity: 4,
    community: 2,
    international: 2,
    fanGrowth: 0.035,
  },
  "star-player-signing": {
    reputation: 3,
    loyalty: 2,
    popularity: 8,
    community: 1,
    international: 5,
    fanGrowth: 0.05,
  },
  "community-event": {
    reputation: 3,
    loyalty: 5,
    popularity: 2,
    community: 10,
    international: 0,
    fanGrowth: 0.015,
  },
  controversy: {
    reputation: -8,
    loyalty: -7,
    popularity: -5,
    community: -8,
    international: -5,
    fanGrowth: -0.04,
  },
  "poor-season": {
    reputation: -6,
    loyalty: -4,
    popularity: -5,
    community: -2,
    international: -3,
    fanGrowth: -0.02,
  },
};

export function applyReputationEvent(
  franchise: FranchiseReputation,
  event: ReputationEvent,
): FranchiseReputation {
  const effect = EVENT_EFFECTS[event.type];

  if (!effect) {
    throw new Error("Unknown reputation event.");
  }

  const magnitude = event.magnitude ?? 1;

  if (!Number.isFinite(magnitude) || magnitude < 0 || magnitude > 3) {
    throw new Error("Event magnitude must be between 0 and 3.");
  }

  const fanChange = Math.round(
    franchise.totalFans * effect.fanGrowth * magnitude,
  );

  return {
    ...franchise,
    reputation: clamp(franchise.reputation + effect.reputation * magnitude),
    fanLoyalty: clamp(franchise.fanLoyalty + effect.loyalty * magnitude),
    popularity: clamp(franchise.popularity + effect.popularity * magnitude),
    communitySupport: clamp(
      franchise.communitySupport + effect.community * magnitude,
    ),
    internationalRecognition: clamp(
      franchise.internationalRecognition +
        effect.international * magnitude,
    ),
    totalFans: Math.max(0, franchise.totalFans + fanChange),
    lastUpdated: Date.now(),
  };
}

export function getReputationTier(
  reputation: number,
): ReputationTier {
  validateScore(reputation, "Reputation");

  if (reputation >= 95) return "global-icon";
  if (reputation >= 85) return "elite";
  if (reputation >= 70) return "popular";
  if (reputation >= 50) return "established";
  if (reputation >= 30) return "developing";

  return "unknown";
}

export function calculateFranchiseBrandScore(
  franchise: FranchiseReputation,
): number {
  const score =
    franchise.reputation * 0.3 +
    franchise.fanLoyalty * 0.25 +
    franchise.popularity * 0.2 +
    franchise.communitySupport * 0.1 +
    franchise.internationalRecognition * 0.15;

  return Math.round(score);
}

export function rankFranchisesByReputation(
  franchises: FranchiseReputation[],
): FranchiseReputation[] {
  return [...franchises].sort(
    (a, b) =>
      calculateFranchiseBrandScore(b) -
      calculateFranchiseBrandScore(a),
  );
}

export function calculateFanGrowthRate(
  previousFans: number,
  currentFans: number,
): number {
  if (
    !Number.isFinite(previousFans) ||
    !Number.isFinite(currentFans) ||
    previousFans < 0 ||
    currentFans < 0
  ) {
    throw new Error("Fan counts must be non-negative.");
  }

  if (previousFans === 0) return currentFans > 0 ? 100 : 0;

  return Number(
    (((currentFans - previousFans) / previousFans) * 100).toFixed(2),
  );
}
