
export type ContractStatus =
  | "active"
  | "expiring"
  | "expired"
  | "released"
  | "renewed";

export interface PlayerContract {
  contractId: string;
  playerId: string;
  franchiseId: string;
  annualSalary: number;
  startSeason: number;
  endSeason: number;
  status: ContractStatus;
  signingBonus: number;
  createdAt: number;
}

export interface ContractRenewal {
  playerId: string;
  franchiseId: string;
  previousSalary: number;
  proposedSalary: number;
  additionalSeasons: number;
  accepted: boolean;
}

export interface SalaryCapSummary {
  salaryCap: number;
  committedSalary: number;
  availableBudget: number;
  squadSize: number;
  contractCount: number;
  isOverCap: boolean;
}

function validateMoney(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number.`);
  }
}

export function createPlayerContract(
  playerId: string,
  franchiseId: string,
  annualSalary: number,
  startSeason: number,
  durationSeasons: number,
  signingBonus = 0,
): PlayerContract {
  if (!playerId.trim() || !franchiseId.trim()) {
    throw new Error("Player and franchise IDs are required.");
  }

  validateMoney(annualSalary, "Annual salary");
  validateMoney(signingBonus, "Signing bonus");

  if (!Number.isInteger(startSeason) || startSeason < 2000) {
    throw new Error("Invalid contract start season.");
  }

  if (
    !Number.isInteger(durationSeasons) ||
    durationSeasons < 1 ||
    durationSeasons > 10
  ) {
    throw new Error("Contract duration must be 1–10 seasons.");
  }

  return {
    contractId: `contract-${playerId}-${startSeason}`,
    playerId,
    franchiseId,
    annualSalary,
    startSeason,
    endSeason: startSeason + durationSeasons - 1,
    status: "active",
    signingBonus,
    createdAt: Date.now(),
  };
}

export function getContractStatus(
  contract: PlayerContract,
  currentSeason: number,
): ContractStatus {
  if (!Number.isInteger(currentSeason) || currentSeason < 2000) {
    throw new Error("Invalid current season.");
  }

  if (contract.status === "released") return "released";

  if (currentSeason > contract.endSeason) {
    return "expired";
  }

  if (contract.endSeason - currentSeason <= 1) {
    return "expiring";
  }

  return "active";
}

export function renewPlayerContract(
  contract: PlayerContract,
  proposedSalary: number,
  additionalSeasons: number,
  accepted: boolean,
): PlayerContract {
  validateMoney(proposedSalary, "Proposed salary");

  if (
    !Number.isInteger(additionalSeasons) ||
    additionalSeasons < 1 ||
    additionalSeasons > 10
  ) {
    throw new Error("Additional duration must be 1–10 seasons.");
  }

  if (!accepted) {
    return contract;
  }

  return {
    ...contract,
    annualSalary: proposedSalary,
    endSeason: contract.endSeason + additionalSeasons,
    status: "renewed",
    createdAt: Date.now(),
  };
}

export function releasePlayerContract(
  contract: PlayerContract,
): PlayerContract {
  if (contract.status === "released") {
    return contract;
  }

  return {
    ...contract,
    status: "released",
  };
}

export function calculateSalaryCap(
  contracts: PlayerContract[],
  salaryCap: number,
  currentSeason: number,
): SalaryCapSummary {
  validateMoney(salaryCap, "Salary cap");

  const activeContracts = contracts.filter((contract) => {
    const status = getContractStatus(contract, currentSeason);

    return status === "active" || status === "expiring";
  });

  const committedSalary = activeContracts.reduce(
    (total, contract) => total + contract.annualSalary,
    0,
  );

  return {
    salaryCap,
    committedSalary,
    availableBudget: salaryCap - committedSalary,
    squadSize: new Set(activeContracts.map((contract) => contract.playerId)).size,
    contractCount: activeContracts.length,
    isOverCap: committedSalary > salaryCap,
  };
}

export function getExpiringContracts(
  contracts: PlayerContract[],
  currentSeason: number,
): PlayerContract[] {
  return contracts.filter(
    (contract) =>
      getContractStatus(contract, currentSeason) === "expiring",
  );
}

export function getContractsByFranchise(
  contracts: PlayerContract[],
  franchiseId: string,
): PlayerContract[] {
  return contracts.filter(
    (contract) => contract.franchiseId === franchiseId,
  );
}
