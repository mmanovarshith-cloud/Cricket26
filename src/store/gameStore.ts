
import { create } from 'zustand';
import { INITIAL_FRANCHISES } from '../data/franchises';
import { INITIAL_PLAYERS } from '../data/players';
import type { Franchise, Player } from '../types/game';

type GameState = {
  franchises: Franchise[];
  players: Player[];
  selectedFranchiseId: string | null;

  selectFranchise: (franchiseId: string) => void;
  signPlayer: (playerId: string, franchiseId: string, bidAmount: number) => boolean;
  releasePlayer: (playerId: string, franchiseId: string) => void;
  resetGame: () => void;
};

const cloneInitialFranchises = (): Franchise[] =>
  INITIAL_FRANCHISES.map((franchise) => ({
    ...franchise,
    squad: [],
  }));

const cloneInitialPlayers = (): Player[] =>
  INITIAL_PLAYERS.map((player) => ({ ...player }));

export const useGameStore = create<GameState>((set, get) => ({
  franchises: cloneInitialFranchises(),
  players: cloneInitialPlayers(),
  selectedFranchiseId: null,

  selectFranchise: (franchiseId) => {
    const exists = get().franchises.some(
      (franchise) => franchise.id === franchiseId,
    );

    if (!exists) return;

    set({ selectedFranchiseId: franchiseId });
  },

  signPlayer: (playerId, franchiseId, bidAmount) => {
    const { franchises, players } = get();

    const franchise = franchises.find(
      (item) => item.id === franchiseId,
    );

    const player = players.find(
      (item) => item.id === playerId,
    );

    if (!franchise || !player) return false;
    if (player.teamId) return false;
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) return false;
    if (bidAmount < player.basePrice) return false;
    if (franchise.remainingBudget < bidAmount) return false;
    if (franchise.squad.length >= 25) return false;

    const updatedPlayer: Player = {
      ...player,
      teamId: franchiseId,
      auctionPrice: bidAmount,
    };

    const updatedFranchise: Franchise = {
      ...franchise,
      remainingBudget: franchise.remainingBudget - bidAmount,
      squad: [...franchise.squad, updatedPlayer],
    };

    set({
      players: players.map((item) =>
        item.id === playerId ? updatedPlayer : item,
      ),
      franchises: franchises.map((item) =>
        item.id === franchiseId ? updatedFranchise : item,
      ),
    });

    return true;
  },

  releasePlayer: (playerId, franchiseId) => {
    const { franchises, players } = get();

    const franchise = franchises.find(
      (item) => item.id === franchiseId,
    );

    const player = players.find(
      (item) => item.id === playerId,
    );

    if (!franchise || !player || player.teamId !== franchiseId) return;

    const refund = player.auctionPrice ?? player.basePrice;

    const releasedPlayer: Player = {
      ...player,
      teamId: undefined,
      auctionPrice: undefined,
    };

    const updatedFranchise: Franchise = {
      ...franchise,
      remainingBudget: franchise.remainingBudget + refund,
      squad: franchise.squad.filter((item) => item.id !== playerId),
    };

    set({
      players: players.map((item) =>
        item.id === playerId ? releasedPlayer : item,
      ),
      franchises: franchises.map((item) =>
        item.id === franchiseId ? updatedFranchise : item,
      ),
    });
  },

  resetGame: () => {
    set({
      franchises: cloneInitialFranchises(),
      players: cloneInitialPlayers(),
      selectedFranchiseId: null,
    });
  },
}));
