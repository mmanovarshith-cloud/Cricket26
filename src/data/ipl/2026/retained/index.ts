
/**
 * WORLD CRICKET ZENITH
 * IPL 2026 - Central Retained Player Database
 *
 * Combines all ten franchise retention records.
 * Existing team files remain unchanged.
 */

import { CSK_RETAINED_PLAYERS_2026 } from "./csk";
import { DC_RETAINED_PLAYERS_2026 } from "./dc";
import { OTHER_IPL_RETAINED_PLAYERS_2026 } from "./otherTeams";

import type { IPLRetainedPlayerRecord } from "./csk";

// All retained players from all ten franchises.

export const IPL_RETAINED_PLAYERS_2026: IPLRetainedPlayerRecord[] = [
  ...CSK_RETAINED_PLAYERS_2026,
  ...DC_RETAINED_PLAYERS_2026,
  ...OTHER_IPL_RETAINED_PLAYERS_2026,
];

// Get retained players belonging to a franchise.

export const getRetainedPlayersByFranchise = (
  franchiseId: string
): IPLRetainedPlayerRecord[] => {
  return IPL_RETAINED_PLAYERS_2026.filter(
    (player) => player.franchiseId === franchiseId
  );
};

// Find a player using their unique ID.

export const getRetainedPlayerById = (
  playerId: string
): IPLRetainedPlayerRecord | undefined => {
  return IPL_RETAINED_PLAYERS_2026.find(
    (player) => player.id === playerId
  );
};

// Find a player by name.

export const searchRetainedPlayers = (
  searchTerm: string
): IPLRetainedPlayerRecord[] => {
  const query = searchTerm.trim().toLowerCase();

  if (!query) return [];

  return IPL_RETAINED_PLAYERS_2026.filter((player) =>
    player.fullName.toLowerCase().includes(query)
  );
};

// Count players by franchise.

export const IPL_RETAINED_PLAYER_COUNTS: Record<string, number> = {
  csk: getRetainedPlayersByFranchise("csk").length,
  dc: getRetainedPlayersByFranchise("dc").length,
  gt: getRetainedPlayersByFranchise("gt").length,
  kkr: getRetainedPlayersByFranchise("kkr").length,
  lsg: getRetainedPlayersByFranchise("lsg").length,
  mi: getRetainedPlayersByFranchise("mi").length,
  pbks: getRetainedPlayersByFranchise("pbks").length,
  rr: getRetainedPlayersByFranchise("rr").length,
  rcb: getRetainedPlayersByFranchise("rcb").length,
  srh: getRetainedPlayersByFranchise("srh").length,
};

// Database summary.

export const IPL_RETAINED_DATABASE_SUMMARY = {
  season: 2026,
  competition: "IPL",
  franchiseCount: 10,
  totalPlayers: IPL_RETAINED_PLAYERS_2026.length,
  overseasPlayers: IPL_RETAINED_PLAYERS_2026.filter(
    (player) => player.isOverseas
  ).length,
  domesticPlayers: IPL_RETAINED_PLAYERS_2026.filter(
    (player) => !player.isOverseas
  ).length,
};

// Check for duplicate player IDs.

export const findDuplicateRetainedPlayerIds = (): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const player of IPL_RETAINED_PLAYERS_2026) {
    if (seen.has(player.id)) {
      duplicates.add(player.id);
    }

    seen.add(player.id);
  }

  return [...duplicates];
};

// Validate franchise IDs and player records.

export const validateIPLRetainedDatabase = (): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  const validFranchiseIds = [
    "csk", "dc", "gt", "kkr", "lsg",
    "mi", "pbks", "rr", "rcb", "srh",
  ];

  for (const player of IPL_RETAINED_PLAYERS_2026) {
    if (!validFranchiseIds.includes(player.franchiseId)) {
      errors.push(
        `Invalid franchise ID: ${player.franchiseId} (${player.fullName})`
      );
    }

    if (!player.fullName.trim()) {
      errors.push(`Player ${player.id} has an empty name.`);
    }

    if (player.season !== 2026) {
      errors.push(
        `Incorrect season for player: ${player.fullName}`
      );
    }
  }

  const duplicates = findDuplicateRetainedPlayerIds();

  for (const id of duplicates) {
    errors.push(`Duplicate player ID: ${id}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
