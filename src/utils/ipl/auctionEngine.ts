
import {
  IPL_SQUAD_RULES,
  type IPLSquadPlayer,
  canSignPlayer,
} from "./squadRules";

export interface AuctionPlayer extends IPLSquadPlayer {
  basePrice: number;
  rating: number;
  role: string;
}

export interface FranchiseAuctionState {
  franchiseId: string;
  purseRemaining: number;
  squad: IPLSquadPlayer[];
  totalSpent: number;
}

export interface AuctionLot {
  player: AuctionPlayer;
  currentBid: number;
  highestBidderId: string | null;
  status: "upcoming" | "live" | "sold" | "unsold";
}

export interface AuctionResult {
  success: boolean;
  message: string;
  lot: AuctionLot;
  franchise?: FranchiseAuctionState;
}

export interface AuctionSummary {
  franchiseId: string;
  initialPurse: number;
  purseRemaining: number;
  totalSpent: number;
  playersSigned: number;
  overseasPlayers: number;
}

export function createAuctionLot(
  player: AuctionPlayer,
): AuctionLot {
  return {
    player,
    currentBid: player.basePrice,
    highestBidderId: null,
    status: "upcoming",
  };
}

export function startAuctionLot(
  lot: AuctionLot,
): AuctionLot {
  if (lot.status !== "upcoming") {
    throw new Error("Only upcoming lots can be started.");
  }

  return {
    ...lot,
    status: "live",
  };
}

export function getMinimumNextBid(
  currentBid: number,
  minimumIncrement: number,
): number {
  if (currentBid < 0 || minimumIncrement <= 0) {
    throw new Error("Invalid bid or increment.");
  }

  return currentBid + minimumIncrement;
}

export function getMaximumAffordableBid(
  franchise: FranchiseAuctionState,
): number {
  const remainingSlots =
    IPL_SQUAD_RULES.MAX_SQUAD_SIZE - franchise.squad.length;

  if (remainingSlots <= 0) {
    return 0;
  }

  return Math.max(0, franchise.purseRemaining);
}

export function placeAuctionBid(
  lot: AuctionLot,
  franchise: FranchiseAuctionState,
  bidAmount: number,
  minimumIncrement: number,
): AuctionResult {
  const fail = (message: string): AuctionResult => ({
    success: false,
    message,
    lot,
  });

  if (lot.status !== "live") {
    return fail("This auction lot is not currently live.");
  }

  if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
    return fail("Enter a valid bid amount.");
  }

  if (lot.highestBidderId === franchise.franchiseId) {
    return fail("Your franchise already holds the highest bid.");
  }

  const minimumBid =
    lot.highestBidderId === null
      ? lot.player.basePrice
      : getMinimumNextBid(lot.currentBid, minimumIncrement);

  if (bidAmount < minimumBid) {
    return fail(`The minimum acceptable bid is ₹${minimumBid} lakh.`);
  }

  if (bidAmount > franchise.purseRemaining) {
    return fail("Your franchise does not have enough purse remaining.");
  }

  const signingCheck = canSignPlayer(
    franchise.squad,
    lot.player,
  );

  if (!signingCheck.allowed) {
    return fail(signingCheck.reason ?? "Player cannot be signed.");
  }

  return {
    success: true,
    message: "Bid accepted.",
    lot: {
      ...lot,
      currentBid: bidAmount,
      highestBidderId: franchise.franchiseId,
    },
    franchise,
  };
}

export function sellAuctionPlayer(
  lot: AuctionLot,
  franchise: FranchiseAuctionState,
): AuctionResult {
  if (lot.status !== "live") {
    return {
      success: false,
      message: "This auction lot is not live.",
      lot,
    };
  }

  if (lot.highestBidderId !== franchise.franchiseId) {
    return {
      success: false,
      message: "This franchise is not the highest bidder.",
      lot,
    };
  }

  if (franchise.purseRemaining < lot.currentBid) {
    return {
      success: false,
      message: "Insufficient purse to complete the purchase.",
      lot,
    };
  }

  const signingCheck = canSignPlayer(
    franchise.squad,
    lot.player,
  );

  if (!signingCheck.allowed) {
    return {
      success: false,
      message: signingCheck.reason ?? "Player cannot be signed.",
      lot,
    };
  }

  const updatedFranchise: FranchiseAuctionState = {
    ...franchise,
    purseRemaining: franchise.purseRemaining - lot.currentBid,
    totalSpent: franchise.totalSpent + lot.currentBid,
    squad: [...franchise.squad, lot.player],
  };

  return {
    success: true,
    message: `${lot.player.fullName} has been signed successfully.`,
    lot: {
      ...lot,
      status: "sold",
    },
    franchise: updatedFranchise,
  };
}

export function markAuctionLotUnsold(
  lot: AuctionLot,
): AuctionLot {
  if (lot.status !== "live" || lot.highestBidderId !== null) {
    throw new Error("Only a live lot without bids can be marked unsold.");
  }

  return {
    ...lot,
    status: "unsold",
  };
}

export function getAuctionSummary(
  franchise: FranchiseAuctionState,
  initialPurse: number,
): AuctionSummary {
  const overseasPlayers = franchise.squad.filter(
    (player) => player.isOverseas,
  ).length;

  return {
    franchiseId: franchise.franchiseId,
    initialPurse,
    purseRemaining: franchise.purseRemaining,
    totalSpent: franchise.totalSpent,
    playersSigned: franchise.squad.length,
    overseasPlayers,
  };
}

export function calculatePursePercentage(
  franchise: FranchiseAuctionState,
  initialPurse: number,
): number {
  if (initialPurse <= 0) {
    return 0;
  }

  const percentage =
    (franchise.purseRemaining / initialPurse) * 100;

  return Math.max(0, Math.min(100, percentage));
}
