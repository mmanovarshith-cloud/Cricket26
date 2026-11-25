
import type { PlayerRole } from '../types/game';

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';

  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  }

  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(2)} L`;
  }

  return formatCurrency(amount);
}

export function formatRating(rating: number): string {
  const safeRating = Math.min(100, Math.max(0, rating));

  return `${Math.round(safeRating)}/100`;
}

export function getRatingLabel(rating: number): string {
  if (rating >= 90) return 'Elite';
  if (rating >= 85) return 'World Class';
  if (rating >= 80) return 'Excellent';
  if (rating >= 70) return 'Good';
  if (rating >= 60) return 'Average';

  return 'Developing';
}

export function formatMatchDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

export function formatMatchTime(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Time unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsedDate);
}

export function formatPlayerRole(role: PlayerRole): string {
  const labels: Record<PlayerRole, string> = {
    batter: 'Batter',
    bowler: 'Bowler',
    'all-rounder': 'All-Rounder',
    'wicket-keeper': 'Wicket-Keeper',
  };

  return labels[role];
}

export function formatOvers(legalBalls: number): string {
  const safeBalls = Math.max(0, Math.floor(legalBalls));

  return `${Math.floor(safeBalls / 6)}.${safeBalls % 6}`;
}
