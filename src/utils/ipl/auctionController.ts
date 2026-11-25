
import type {
  AuctionLot,
  AuctionPlayer,
  FranchiseAuctionState,
  AuctionResult,
} from "./auctionEngine";

import {
  createAuctionLot,
  startAuctionLot,
  placeAuctionBid,
  sellAuctionPlayer,
  markAuctionLotUnsold,
} from "./auctionEngine";

import type {
  AuctionAIProfile,
  AuctionAIDecision,
} from "./auctionAI";

import {
  evaluateAuctionPlayer,
} from "./auctionAI";

export interface AuctionControllerState {
  lots: AuctionLot[];
  franchises: FranchiseAuctionState[];
  currentLotIndex: number;
  minimumIncrement: number;
  isAuctionActive: boolean;
  completedLots: number;
  soldLots: number;
  unsoldLots: number;
  bidHistory: AuctionBidRecord[];
}

export interface AuctionBidRecord {
  playerId: string;
  franchiseId: string;
  amount: number;
  bidderType: "human" | "ai";
  timestamp: number;
}

export interface AuctionControllerConfig {
  players: AuctionPlayer[];
  franchises: FranchiseAuctionState[];
  aiProfiles: AuctionAIProfile[];
  minimumIncrement: number;
}

export interface AuctionControllerAction {
  success: boolean;
  message: string;
  state: AuctionControllerState;
}

function cloneFranchise(
  franchise: FranchiseAuctionState,
): FranchiseAuctionState {
  return {
    ...franchise,
    squad: [...franchise.squad],
  };
}

function cloneLot(lot: AuctionLot): AuctionLot {
  return {
    ...lot,
    player: { ...lot.player },
  };
}

export function createAuctionController(
  config: AuctionControllerConfig,
): AuctionControllerState {
  if (config.minimumIncrement <= 0) {
    throw new Error("Minimum bid increment must be positive.");
  }

  const franchiseIds = new Set<string>();

  for (const franchise of config.franchises) {
    if (franchiseIds.has(franchise.franchiseId)) {
      throw new Error(
        `Duplicate franchise: ${franchise.franchiseId}`,
      );
    }

    franchiseIds.add(franchise.franchiseId);
  }

  return {
    lots: config.players.map(createAuctionLot),
    franchises: config.franchises.map(cloneFranchise),
    currentLotIndex: -1,
    minimumIncrement: config.minimumIncrement,
    isAuctionActive: false,
    completedLots: 0,
    soldLots: 0,
    unsoldLots: 0,
    bidHistory: [],
  };
}

function updateFranchise(
  state: AuctionControllerState,
  updated: FranchiseAuctionState,
): AuctionControllerState {
  return {
    ...state,
    franchises: state.franchises.map((franchise) =>
      franchise.franchiseId === updated.franchiseId
        ? updated
        : franchise,
    ),
  };
}

function recordBid(
  state: AuctionControllerState,
  playerId: string,
  franchiseId: string,
  amount: number,
  bidderType: "human" | "ai",
): AuctionControllerState {
  return {
    ...state,
    bidHistory: [
      ...state.bidHistory,
      {
        playerId,
        franchiseId,
        amount,
        bidderType,
        timestamp: Date.now(),
      },
    ],
  };
}

export function startNextAuctionLot(
  state: AuctionControllerState,
): AuctionControllerAction {
  const nextIndex = state.currentLotIndex + 1;

  if (nextIndex >= state.lots.length) {
    return {
      success: false,
      message: "All auction lots have been completed.",
      state: {
        ...state,
        isAuctionActive: false,
      },
    };
  }

  const lots = state.lots.map(cloneLot);
  lots[nextIndex] = startAuctionLot(lots[nextIndex]);

  return {
    success: true,
    message: `Auction started for ${lots[nextIndex].player.fullName}.`,
    state: {
      ...state,
      lots,
      currentLotIndex: nextIndex,
      isAuctionActive: true,
    },
  };
}

export function submitHumanBid(
  state: AuctionControllerState,
  franchiseId: string,
  bidAmount: number,
): AuctionControllerAction {
  const lot = state.lots[state.currentLotIndex];

  if (!state.isAuctionActive || !lot) {
    return {
      success: false,
      message: "No active auction lot.",
      state,
    };
  }

  const franchise = state.franchises.find(
    (item) => item.franchiseId === franchiseId,
  );

  if (!franchise) {
    return {
      success: false,
      message: "Franchise not found.",
      state,
    };
  }

  const result: AuctionResult = placeAuctionBid(
    lot,
    franchise,
    bidAmount,
    state.minimumIncrement,
  );

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      state,
    };
  }

  const lots = state.lots.map((item, index) =>
    index === state.currentLotIndex ? result.lot : item,
  );

  const updatedState = recordBid(
    { ...state, lots },
    lot.player.id,
    franchiseId,
    bidAmount,
    "human",
  );

  return {
    success: true,
    message: result.message,
    state: updatedState,
  };
}

export function runAIBiddingRound(
  state: AuctionControllerState,
  profiles: readonly AuctionAIProfile[],
): AuctionControllerAction {
  const lot = state.lots[state.currentLotIndex];

  if (!state.isAuctionActive || !lot) {
    return {
      success: false,
      message: "No active auction lot.",
      state,
    };
  }

  let workingState = state;
  let acceptedBids = 0;

  for (const profile of profiles) {
    const franchise = workingState.franchises.find(
      (item) => item.franchiseId === profile.franchiseId,
    );

    const currentLot =
      workingState.lots[workingState.currentLotIndex];

    if (!franchise || !currentLot) {
      continue;
    }

    const decision: AuctionAIDecision = evaluateAuctionPlayer({
      player: currentLot.player,
      lot: currentLot,
      franchise,
      profile,
      minimumIncrement: workingState.minimumIncrement,
    });

    if (!decision.shouldBid) {
      continue;
    }

    const result = placeAuctionBid(
      currentLot,
      franchise,
      decision.bidAmount,
      workingState.minimumIncrement,
    );

    if (!result.success) {
      continue;
    }

    const lots = workingState.lots.map((item, index) =>
      index === workingState.currentLotIndex
        ? result.lot
        : item,
    );

    workingState = recordBid(
      { ...workingState, lots },
      currentLot.player.id,
      franchise.franchiseId,
      decision.bidAmount,
      "ai",
    );

    acceptedBids++;
  }

  return {
    success: true,
    message: acceptedBids > 0
      ? `${acceptedBids} AI bid(s) accepted.`
      : "No AI franchise placed a bid.",
    state: workingState,
  };
}

export function completeCurrentAuctionLot(
  state: AuctionControllerState,
): AuctionControllerAction {
  const lot = state.lots[state.currentLotIndex];

  if (!state.isAuctionActive || !lot) {
    return {
      success: false,
      message: "No active auction lot.",
      state,
    };
  }

  if (lot.highestBidderId === null) {
    const unsoldLot = markAuctionLotUnsold(lot);

    const lots = state.lots.map((item, index) =>
      index === state.currentLotIndex ? unsoldLot : item,
    );

    return {
      success: true,
      message: `${lot.player.fullName} went unsold.`,
      state: {
        ...state,
        lots,
        isAuctionActive: false,
        completedLots: state.completedLots + 1,
        unsoldLots: state.unsoldLots + 1,
      },
    };
  }

  const winningFranchise = state.franchises.find(
    (item) => item.franchiseId === lot.highestBidderId,
  );

  if (!winningFranchise) {
    return {
      success: false,
      message: "Winning franchise could not be found.",
      state,
    };
  }

  const result = sellAuctionPlayer(lot, winningFranchise);

  if (!result.success || !result.franchise) {
    return {
      success: false,
      message: result.message,
      state,
    };
  }

  const lots = state.lots.map((item, index) =>
    index === state.currentLotIndex ? result.lot : item,
  );

  const updatedState = updateFranchise(
    {
      ...state,
      lots,
      isAuctionActive: false,
      completedLots: state.completedLots + 1,
      soldLots: state.soldLots + 1,
    },
    result.franchise,
  );

  return {
    success: true,
    message: result.message,
    state: updatedState,
  };
}

export function getAuctionProgress(
  state: AuctionControllerState,
): {
  totalLots: number;
  completed: number;
  remaining: number;
  percentage: number;
} {
  const totalLots = state.lots.length;
  const completed = state.completedLots;

  return {
    totalLots,
    completed,
    remaining: Math.max(0, totalLots - completed),
    percentage: totalLots === 0
      ? 100
      : Math.round((completed / totalLots) * 100),
  };
}

export function getCurrentAuctionLot(
  state: AuctionControllerState,
): AuctionLot | null {
  if (state.currentLotIndex < 0) {
    return null;
  }

  return state.lots[state.currentLotIndex] ?? null;
}

export function getFranchiseAuctionState(
  state: AuctionControllerState,
  franchiseId: string,
): FranchiseAuctionState | null {
  return (
    state.franchises.find(
      (franchise) => franchise.franchiseId === franchiseId,
    ) ?? null
  );
}
