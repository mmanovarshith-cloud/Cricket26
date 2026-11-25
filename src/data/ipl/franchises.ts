
/**
 * WORLD CRICKET ZENITH
 * Real IPL Franchise Database
 *
 * Separate from the fictional franchise database.
 * Display colours are approximate UI colours.
 * Official logos and brand artwork are not included.
 */

export interface IPLFranchise {
  id: string;
  name: string;
  shortName: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  competition: "IPL";
  dataType: "real";
}

export const IPL_FRANCHISES: IPLFranchise[] = [
  {
    id: "csk",
    name: "Chennai Super Kings",
    shortName: "CSK",
    city: "Chennai",
    primaryColor: "#F9CD05",
    secondaryColor: "#0081C8",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "dc",
    name: "Delhi Capitals",
    shortName: "DC",
    city: "Delhi",
    primaryColor: "#17479E",
    secondaryColor: "#EF1B23",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "gt",
    name: "Gujarat Titans",
    shortName: "GT",
    city: "Ahmedabad",
    primaryColor: "#1B2133",
    secondaryColor: "#C5A46D",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "kkr",
    name: "Kolkata Knight Riders",
    shortName: "KKR",
    city: "Kolkata",
    primaryColor: "#3A225D",
    secondaryColor: "#D4AF37",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "lsg",
    name: "Lucknow Super Giants",
    shortName: "LSG",
    city: "Lucknow",
    primaryColor: "#00AEEF",
    secondaryColor: "#FF6C2F",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "mi",
    name: "Mumbai Indians",
    shortName: "MI",
    city: "Mumbai",
    primaryColor: "#004BA0",
    secondaryColor: "#D1AB3E",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "pbks",
    name: "Punjab Kings",
    shortName: "PBKS",
    city: "New Chandigarh",
    primaryColor: "#ED1B24",
    secondaryColor: "#A7A9AC",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "rr",
    name: "Rajasthan Royals",
    shortName: "RR",
    city: "Jaipur",
    primaryColor: "#EA1A85",
    secondaryColor: "#254AA5",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "rcb",
    name: "Royal Challengers Bengaluru",
    shortName: "RCB",
    city: "Bengaluru",
    primaryColor: "#EC1C24",
    secondaryColor: "#2B2A29",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
  {
    id: "srh",
    name: "Sunrisers Hyderabad",
    shortName: "SRH",
    city: "Hyderabad",
    primaryColor: "#F26522",
    secondaryColor: "#000000",
    accentColor: "#FFFFFF",
    competition: "IPL",
    dataType: "real",
  },
];

export const getIPLFranchiseById = (
  id: string
): IPLFranchise | undefined => {
  return IPL_FRANCHISES.find((franchise) => franchise.id === id);
};

export const getIPLFranchiseByShortName = (
  shortName: string
): IPLFranchise | undefined => {
  return IPL_FRANCHISES.find(
    (franchise) =>
      franchise.shortName.toLowerCase() === shortName.toLowerCase()
  );
};
