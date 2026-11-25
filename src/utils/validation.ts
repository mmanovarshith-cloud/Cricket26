
import type { Franchise, Player } from '../types/game';

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateBid(
  bidAmount: number,
  player: Player,
  franchise: Franchise,
): ValidationResult {
  const errors: string[] = [];

  if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
    errors.push('Bid must be a positive number.');
  }

  if (bidAmount < player.basePrice) {
    errors.push('Bid cannot be below the player base price.');
  }

  if (bidAmount > franchise.remainingBudget) {
    errors.push('Insufficient franchise budget.');
  }

  if (player.teamId) {
    errors.push('Player has already joined a franchise.');
  }

  if (franchise.squad.length >= 25) {
    errors.push('Franchise squad is already full.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateSquad(
  squad: Player[],
): ValidationResult {
  const errors: string[] = [];

  if (squad.length > 25) {
    errors.push('A squad cannot contain more than 25 players.');
  }

  const overseasPlayers = squad.filter(
    (player) => player.isOverseas,
  );

  if (overseasPlayers.length > 8) {
    errors.push('A squad cannot contain more than 8 overseas players.');
  }

  const wicketKeepers = squad.filter(
    (player) =>
      player.role === 'wicket-keeper' || player.isWicketKeeper,
  );

  if (squad.length > 0 && wicketKeepers.length === 0) {
    errors.push('A squad should include at least one wicket-keeper.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validatePlayingXI(
  playingXI: Player[],
): ValidationResult {
  const errors: string[] = [];

  if (playingXI.length !== 11) {
    errors.push('A playing XI must contain exactly 11 players.');
  }

  const overseasPlayers = playingXI.filter(
    (player) => player.isOverseas,
  );

  if (overseasPlayers.length > 4) {
    errors.push('A playing XI cannot contain more than 4 overseas players.');
  }

  const wicketKeepers = playingXI.filter(
    (player) =>
      player.role === 'wicket-keeper' || player.isWicketKeeper,
  );

  if (wicketKeepers.length === 0) {
    errors.push('A playing XI must include a wicket-keeper.');
  }

  const uniquePlayerIds = new Set(
    playingXI.map((player) => player.id),
  );

  if (uniquePlayerIds.size !== playingXI.length) {
    errors.push('A playing XI cannot contain duplicate players.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateFranchiseBudget(
  franchise: Franchise,
): ValidationResult {
  const errors: string[] = [];

  if (franchise.remainingBudget < 0) {
    errors.push('Franchise budget cannot be negative.');
  }

  if (franchise.remainingBudget > franchise.budget) {
    errors.push('Remaining budget cannot exceed the starting budget.');
  }

  const squadSpending = franchise.squad.reduce(
    (total, player) =>
      total + (player.auctionPrice ?? player.basePrice),
    0,
  );

  if (squadSpending > franchise.budget) {
    errors.push('Squad spending exceeds the franchise budget.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
