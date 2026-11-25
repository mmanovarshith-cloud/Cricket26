
export interface IPLSquadPlayer {
  id: string;
  fullName: string;
  franchiseId: string;
  isOverseas: boolean;
}

export const IPL_SQUAD_RULES = {
  MAX_SQUAD_SIZE: 25,
  MAX_OVERSEAS_IN_SQUAD: 8,
  PLAYING_XI_SIZE: 11,
  MAX_OVERSEAS_IN_XI: 4,
} as const;

export interface SquadComposition {
  totalPlayers: number;
  overseasPlayers: number;
  domesticPlayers: number;
  remainingSquadSlots: number;
  remainingOverseasSlots: number;
}

export interface SquadValidationResult {
  valid: boolean;
  errors: string[];
  composition: SquadComposition;
}

export interface PlayingXIValidationResult {
  valid: boolean;
  errors: string[];
  totalPlayers: number;
  overseasPlayers: number;
  domesticPlayers: number;
}

export function getSquadComposition(
  players: readonly IPLSquadPlayer[],
): SquadComposition {
  const overseasPlayers = players.filter(
    (player) => player.isOverseas,
  ).length;

  return {
    totalPlayers: players.length,
    overseasPlayers,
    domesticPlayers: players.length - overseasPlayers,
    remainingSquadSlots: Math.max(
      0,
      IPL_SQUAD_RULES.MAX_SQUAD_SIZE - players.length,
    ),
    remainingOverseasSlots: Math.max(
      0,
      IPL_SQUAD_RULES.MAX_OVERSEAS_IN_SQUAD - overseasPlayers,
    ),
  };
}

function getDuplicatePlayerIds(
  players: readonly IPLSquadPlayer[],
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const player of players) {
    if (seen.has(player.id)) {
      duplicates.add(player.id);
    }

    seen.add(player.id);
  }

  return [...duplicates];
}

function getFranchiseIds(
  players: readonly IPLSquadPlayer[],
): string[] {
  return [...new Set(players.map((player) => player.franchiseId))];
}

export function validateIPLSquad(
  players: readonly IPLSquadPlayer[],
): SquadValidationResult {
  const errors: string[] = [];
  const composition = getSquadComposition(players);

  if (players.length > IPL_SQUAD_RULES.MAX_SQUAD_SIZE) {
    errors.push(
      `Squad exceeds the maximum of ${IPL_SQUAD_RULES.MAX_SQUAD_SIZE} players.`,
    );
  }

  if (
    composition.overseasPlayers >
    IPL_SQUAD_RULES.MAX_OVERSEAS_IN_SQUAD
  ) {
    errors.push(
      `Squad exceeds the maximum of ${IPL_SQUAD_RULES.MAX_OVERSEAS_IN_SQUAD} overseas players.`,
    );
  }

  const duplicateIds = getDuplicatePlayerIds(players);

  if (duplicateIds.length > 0) {
    errors.push(
      `Duplicate player IDs found: ${duplicateIds.join(", ")}.`,
    );
  }

  const franchiseIds = getFranchiseIds(players);

  if (franchiseIds.length > 1) {
    errors.push("A franchise squad cannot contain players from multiple franchises.");
  }

  for (const player of players) {
    if (!player.id.trim()) {
      errors.push("A player has a missing ID.");
      break;
    }

    if (!player.fullName.trim()) {
      errors.push(`Player ${player.id} has a missing name.`);
      break;
    }

    if (!player.franchiseId.trim()) {
      errors.push(`Player ${player.fullName} has no franchise ID.`);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    composition,
  };
}

export function validateIPLPlayingXI(
  playingXI: readonly IPLSquadPlayer[],
  fullSquad: readonly IPLSquadPlayer[],
): PlayingXIValidationResult {
  const errors: string[] = [];

  const overseasPlayers = playingXI.filter(
    (player) => player.isOverseas,
  ).length;

  const domesticPlayers = playingXI.length - overseasPlayers;

  if (playingXI.length !== IPL_SQUAD_RULES.PLAYING_XI_SIZE) {
    errors.push(
      `Playing XI must contain exactly ${IPL_SQUAD_RULES.PLAYING_XI_SIZE} players.`,
    );
  }

  if (overseasPlayers > IPL_SQUAD_RULES.MAX_OVERSEAS_IN_XI) {
    errors.push(
      `Playing XI cannot contain more than ${IPL_SQUAD_RULES.MAX_OVERSEAS_IN_XI} overseas players.`,
    );
  }

  const duplicateIds = getDuplicatePlayerIds(playingXI);

  if (duplicateIds.length > 0) {
    errors.push(
      `Playing XI contains duplicate players: ${duplicateIds.join(", ")}.`,
    );
  }

  const squadIds = new Set(fullSquad.map((player) => player.id));

  for (const player of playingXI) {
    if (!squadIds.has(player.id)) {
      errors.push(`${player.fullName} is not registered in this franchise squad.`);
    }
  }

  const squadFranchiseIds = getFranchiseIds(fullSquad);

  for (const player of playingXI) {
    if (
      squadFranchiseIds.length > 0 &&
      !squadFranchiseIds.includes(player.franchiseId)
    ) {
      errors.push(`${player.fullName} does not belong to this franchise.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    totalPlayers: playingXI.length,
    overseasPlayers,
    domesticPlayers,
  };
}

export function canSignPlayer(
  currentSquad: readonly IPLSquadPlayer[],
  newPlayer: IPLSquadPlayer,
): { allowed: boolean; reason: string | null } {
  if (currentSquad.some((player) => player.id === newPlayer.id)) {
    return {
      allowed: false,
      reason: "This player is already in the squad.",
    };
  }

  if (
    currentSquad.length >= IPL_SQUAD_RULES.MAX_SQUAD_SIZE
  ) {
    return {
      allowed: false,
      reason: "The franchise squad is already full.",
    };
  }

  if (
    getFranchiseIds(currentSquad).length > 0 &&
    !getFranchiseIds(currentSquad).includes(newPlayer.franchiseId)
  ) {
    return {
      allowed: false,
      reason: "This player belongs to a different franchise.",
    };
  }

  const overseasCount = currentSquad.filter(
    (player) => player.isOverseas,
  ).length;

  if (
    newPlayer.isOverseas &&
    overseasCount >= IPL_SQUAD_RULES.MAX_OVERSEAS_IN_SQUAD
  ) {
    return {
      allowed: false,
      reason: "The franchise has reached its overseas-player limit.",
    };
  }

  return {
    allowed: true,
    reason: null,
  };
}
