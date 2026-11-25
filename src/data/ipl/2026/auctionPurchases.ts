
/**
 * WORLD CRICKET ZENITH
 * IPL 2026 Auction Purchases
 *
 * Currency: Indian Rupees (INR)
 * Prices are stored as numbers in rupees.
 *
 * This is the verified featured-purchases dataset.
 * It is not yet the complete list of 77 auction purchases.
 */

export interface IPLAuctionPurchase {
  id: string;
  playerName: string;
  franchiseId: string;
  season: 2026;
  isOverseas: boolean;
  basePrice: number | null;
  soldPrice: number;
  status: "Sold";
  source: "IPL Official";
}

const CRORE = 10_000_000;
const LAKH = 100_000;

export const IPL_AUCTION_PURCHASES_2026: IPLAuctionPurchase[] = [
  {
    id: "ipl26-kkr-cameron-green",
    playerName: "Cameron Green",
    franchiseId: "kkr",
    season: 2026,
    isOverseas: true,
    basePrice: null,
    soldPrice: 25.2 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-kkr-matheesha-pathirana",
    playerName: "Matheesha Pathirana",
    franchiseId: "kkr",
    season: 2026,
    isOverseas: true,
    basePrice: null,
    soldPrice: 18 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-csk-kartik-sharma",
    playerName: "Kartik Sharma",
    franchiseId: "csk",
    season: 2026,
    isOverseas: false,
    basePrice: null,
    soldPrice: 14.2 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-csk-prashant-veer",
    playerName: "Prashant Veer",
    franchiseId: "csk",
    season: 2026,
    isOverseas: false,
    basePrice: null,
    soldPrice: 14.2 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-srh-liam-livingstone",
    playerName: "Liam Livingstone",
    franchiseId: "srh",
    season: 2026,
    isOverseas: true,
    basePrice: null,
    soldPrice: 13 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-kkr-mustafizur-rahman",
    playerName: "Mustafizur Rahman",
    franchiseId: "kkr",
    season: 2026,
    isOverseas: true,
    basePrice: null,
    soldPrice: 9.2 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-lsg-josh-inglis",
    playerName: "Josh Inglis",
    franchiseId: "lsg",
    season: 2026,
    isOverseas: true,
    basePrice: null,
    soldPrice: 8.6 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-dc-auqib-dar",
    playerName: "Auqib Dar",
    franchiseId: "dc",
    season: 2026,
    isOverseas: false,
    basePrice: null,
    soldPrice: 8.4 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-rr-ravi-bishnoi",
    playerName: "Ravi Bishnoi",
    franchiseId: "rr",
    season: 2026,
    isOverseas: false,
    basePrice: null,
    soldPrice: 7.2 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-gt-jason-holder",
    playerName: "Jason Holder",
    franchiseId: "gt",
    season: 2026,
    isOverseas: true,
    basePrice: null,
    soldPrice: 7 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
  {
    id: "ipl26-rcb-venkatesh-iyer",
    playerName: "Venkatesh Iyer",
    franchiseId: "rcb",
    season: 2026,
    isOverseas: false,
    basePrice: null,
    soldPrice: 7 * CRORE,
    status: "Sold",
    source: "IPL Official",
  },
];

// Retrieve purchases for one franchise.

export const getAuctionPurchasesByTeam = (
  franchiseId: string
): IPLAuctionPurchase[] => {
  return IPL_AUCTION_PURCHASES_2026.filter(
    (player) => player.franchiseId === franchiseId
  );
};

// Search auction purchases by player name.

export const searchAuctionPurchases = (
  searchTerm: string
): IPLAuctionPurchase[] => {
  const query = searchTerm.trim().toLowerCase();

  if (!query) return [];

  return IPL_AUCTION_PURCHASES_2026.filter((player) =>
    player.playerName.toLowerCase().includes(query)
  );
};

// Format a player purchase price.

export const formatAuctionPrice = (amount: number): string => {
  if (amount >= CRORE) {
    return `₹${(amount / CRORE).toFixed(2)} Cr`;
  }

  return `₹${(amount / LAKH).toFixed(0)} L`;
};

// Auction database summary.

export const IPL_AUCTION_SUMMARY_2026 = {
  season: 2026,
  totalPlayersSoldInAuction: 77,
  overseasPlayersSold: 29,
  recordsCurrentlyLoaded: IPL_AUCTION_PURCHASES_2026.length,
  completeDatabase: false,
};

// Check for duplicate purchase IDs.

export const findDuplicateAuctionPurchaseIds = (): string[] => {
  const ids = IPL_AUCTION_PURCHASES_2026.map((player) => player.id);

  return ids.filter((id, index) => ids.indexOf(id) !== index);
};
