
export type RevenueType =
  | "match-ticket-sales"
  | "sponsorship"
  | "merchandise"
  | "broadcast-share"
  | "prize-money"
  | "other";

export type ExpenseType =
  | "player-salaries"
  | "staff-salaries"
  | "travel"
  | "stadium"
  | "marketing"
  | "operations"
  | "other";

export interface FinanceTransaction {
  transactionId: string;
  franchiseId: string;
  description: string;
  amount: number;
  category: RevenueType | ExpenseType;
  direction: "income" | "expense";
  season: number;
  createdAt: number;
}

export interface FranchiseFinancialAccount {
  franchiseId: string;
  openingBalance: number;
  transactions: FinanceTransaction[];
}

export interface FinancialSummary {
  franchiseId: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  currentBalance: number;
  transactionCount: number;
}

function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Transaction amount must be non-negative.");
  }
}

function validateSeason(season: number): void {
  if (!Number.isInteger(season) || season < 2000) {
    throw new Error("Invalid financial season.");
  }
}

export function createFinancialAccount(
  franchiseId: string,
  openingBalance = 0,
): FranchiseFinancialAccount {
  if (!franchiseId.trim()) {
    throw new Error("Franchise ID is required.");
  }

  validateAmount(openingBalance);

  return {
    franchiseId,
    openingBalance,
    transactions: [],
  };
}

export function recordFinanceTransaction(
  account: FranchiseFinancialAccount,
  description: string,
  amount: number,
  category: RevenueType | ExpenseType,
  direction: "income" | "expense",
  season: number,
): FranchiseFinancialAccount {
  if (!description.trim()) {
    throw new Error("Transaction description is required.");
  }

  validateAmount(amount);
  validateSeason(season);

  const transaction: FinanceTransaction = {
    transactionId: `${account.franchiseId}-${Date.now()}-${account.transactions.length}`,
    franchiseId: account.franchiseId,
    description,
    amount,
    category,
    direction,
    season,
    createdAt: Date.now(),
  };

  return {
    ...account,
    transactions: [...account.transactions, transaction],
  };
}

export function calculateFinancialSummary(
  account: FranchiseFinancialAccount,
  season?: number,
): FinancialSummary {
  if (season !== undefined) {
    validateSeason(season);
  }

  const transactions = account.transactions.filter(
    (transaction) =>
      season === undefined || transaction.season === season,
  );

  const totalRevenue = transactions
    .filter((transaction) => transaction.direction === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.direction === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  return {
    franchiseId: account.franchiseId,
    totalRevenue,
    totalExpenses,
    netProfit,
    currentBalance:
      account.openingBalance + netProfit,
    transactionCount: transactions.length,
  };
}

export function getTransactionsByCategory(
  account: FranchiseFinancialAccount,
  category: RevenueType | ExpenseType,
): FinanceTransaction[] {
  return account.transactions.filter(
    (transaction) => transaction.category === category,
  );
}

export function getSeasonTransactions(
  account: FranchiseFinancialAccount,
  season: number,
): FinanceTransaction[] {
  validateSeason(season);

  return account.transactions.filter(
    (transaction) => transaction.season === season,
  );
}

export function calculateProfitMargin(
  summary: FinancialSummary,
): number {
  if (summary.totalRevenue === 0) return 0;

  return Number(
    ((summary.netProfit / summary.totalRevenue) * 100).toFixed(2),
  );
}

export function canAffordExpense(
  account: FranchiseFinancialAccount,
  amount: number,
): boolean {
  validateAmount(amount);

  const summary = calculateFinancialSummary(account);

  return summary.currentBalance >= amount;
}
