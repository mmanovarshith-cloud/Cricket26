
export type SponsorshipTier =
  | "local"
  | "regional"
  | "national"
  | "international"
  | "global";

export type SponsorshipStatus =
  | "active"
  | "expired"
  | "terminated";

export interface SponsorshipDeal {
  dealId: string;
  franchiseId: string;
  sponsorName: string;
  tier: SponsorshipTier;
  annualValue: number;
  startSeason: number;
  endSeason: number;
  status: SponsorshipStatus;
  performanceBonus: number;
  createdAt: number;
}

export interface SponsorshipProposal {
  franchiseId: string;
  sponsorName: string;
  tier: SponsorshipTier;
  annualValue: number;
  durationSeasons: number;
  minimumReputation: number;
  performanceBonus: number;
}

export interface SponsorshipSummary {
  franchiseId: string;
  activeDeals: number;
  annualRevenue: number;
  potentialBonuses: number;
  totalContractValue: number;
}

const TIER_REQUIREMENTS: Record<SponsorshipTier, number> = {
  local: 10,
  regional: 25,
  national: 40,
  international: 60,
  global: 80,
};

function validateMoney(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be non-negative.`);
  }
}

export function evaluateSponsorshipProposal(
  proposal: SponsorshipProposal,
  franchiseReputation: number,
): {
  accepted: boolean;
  requiredReputation: number;
  reason: string;
} {
  validateMoney(proposal.annualValue, "Annual value");
  validateMoney(proposal.performanceBonus, "Performance bonus");

  if (
    !Number.isFinite(franchiseReputation) ||
    franchiseReputation < 0 ||
    franchiseReputation > 100
  ) {
    throw new Error("Franchise reputation must be between 0 and 100.");
  }

  const requiredReputation = Math.max(
    TIER_REQUIREMENTS[proposal.tier],
    proposal.minimumReputation,
  );

  const accepted = franchiseReputation >= requiredReputation;

  return {
    accepted,
    requiredReputation,
    reason: accepted
      ? "Franchise meets the sponsor's reputation requirements."
      : "Franchise reputation is below the required level.",
  };
}

export function createSponsorshipDeal(
  proposal: SponsorshipProposal,
  currentSeason: number,
  franchiseReputation: number,
): SponsorshipDeal {
  if (!proposal.franchiseId.trim() || !proposal.sponsorName.trim()) {
    throw new Error("Franchise ID and sponsor name are required.");
  }

  if (!Number.isInteger(currentSeason) || currentSeason < 2000) {
    throw new Error("Invalid current season.");
  }

  if (
    !Number.isInteger(proposal.durationSeasons) ||
    proposal.durationSeasons < 1 ||
    proposal.durationSeasons > 10
  ) {
    throw new Error("Deal duration must be 1–10 seasons.");
  }

  const evaluation = evaluateSponsorshipProposal(
    proposal,
    franchiseReputation,
  );

  if (!evaluation.accepted) {
    throw new Error(evaluation.reason);
  }

  return {
    dealId: `sponsor-${proposal.franchiseId}-${Date.now()}`,
    franchiseId: proposal.franchiseId,
    sponsorName: proposal.sponsorName,
    tier: proposal.tier,
    annualValue: proposal.annualValue,
    startSeason: currentSeason,
    endSeason: currentSeason + proposal.durationSeasons - 1,
    status: "active",
    performanceBonus: proposal.performanceBonus,
    createdAt: Date.now(),
  };
}

export function getSponsorshipStatus(
  deal: SponsorshipDeal,
  currentSeason: number,
): SponsorshipStatus {
  if (deal.status === "terminated") return "terminated";

  return currentSeason > deal.endSeason
    ? "expired"
    : "active";
}

export function terminateSponsorshipDeal(
  deal: SponsorshipDeal,
): SponsorshipDeal {
  return {
    ...deal,
    status: "terminated",
  };
}

export function calculateSponsorshipSummary(
  deals: SponsorshipDeal[],
  franchiseId: string,
  currentSeason: number,
): SponsorshipSummary {
  const activeDeals = deals.filter(
    (deal) =>
      deal.franchiseId === franchiseId &&
      getSponsorshipStatus(deal, currentSeason) === "active",
  );

  const annualRevenue = activeDeals.reduce(
    (sum, deal) => sum + deal.annualValue,
    0,
  );

  const potentialBonuses = activeDeals.reduce(
    (sum, deal) => sum + deal.performanceBonus,
    0,
  );

  const totalContractValue = activeDeals.reduce(
    (sum, deal) =>
      sum +
      deal.annualValue *
        (deal.endSeason - currentSeason + 1),
    0,
  );

  return {
    franchiseId,
    activeDeals: activeDeals.length,
    annualRevenue,
    potentialBonuses,
    totalContractValue,
  };
}

export function getExpiringSponsorships(
  deals: SponsorshipDeal[],
  currentSeason: number,
): SponsorshipDeal[] {
  return deals.filter(
    (deal) =>
      getSponsorshipStatus(deal, currentSeason) === "active" &&
      deal.endSeason - currentSeason <= 1,
  );
}
