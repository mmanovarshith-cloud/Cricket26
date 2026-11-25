
/**
 * WORLD CRICKET ZENITH
 * IPL 2026 - Remaining Eight Franchises
 * Retained-player database
 *
 * CSK and DC are maintained in their existing files.
 * Auction purchases will be added separately.
 */

import type { IPLRetainedPlayerRecord } from "./csk";

type PlayerEntry = [
  id: string,
  fullName: string,
  isOverseas: boolean,
  contractStatus?: "Retained" | "Traded"
];

const createTeamRecords = (
  franchiseId: string,
  players: PlayerEntry[]
): IPLRetainedPlayerRecord[] =>
  players.map(([id, fullName, isOverseas, contractStatus]) => ({
    id: `${franchiseId}-2026-${id}`,
    fullName,
    franchiseId,
    season: 2026,
    isOverseas,
    contractStatus: contractStatus ?? "Retained",
    source: "IPL Official",
  }));

// 1. GUJARAT TITANS

export const GT_RETAINED_PLAYERS_2026 = createTeamRecords("gt", [
  ["anuj-rawat", "Anuj Rawat", false],
  ["glenn-phillips", "Glenn Phillips", true],
  ["gurnoor-singh-brar", "Gurnoor Singh Brar", false],
  ["ishant-sharma", "Ishant Sharma", false],
  ["jayant-yadav", "Jayant Yadav", false],
  ["jos-buttler", "Jos Buttler", true],
  ["kagiso-rabada", "Kagiso Rabada", true],
  ["kumar-kushagra", "Kumar Kushagra", false],
  ["manav-suthar", "Manav Suthar", false],
  ["mohammad-siraj", "Mohammad Siraj", false],
  ["arshad-khan", "Mohd. Arshad Khan", false],
  ["nishant-sindhu", "Nishant Sindhu", false],
  ["prasidh-krishna", "Prasidh Krishna", false],
  ["sai-kishore", "R. Sai Kishore", false],
  ["rahul-tewatia", "Rahul Tewatia", false],
  ["rashid-khan", "Rashid Khan", true],
  ["sai-sudharsan", "Sai Sudharsan", false],
  ["shahrukh-khan", "Shahrukh Khan", false],
  ["shubman-gill", "Shubman Gill", false],
  ["washington-sundar", "Washington Sundar", false],
]);

// 2. KOLKATA KNIGHT RIDERS

export const KKR_RETAINED_PLAYERS_2026 = createTeamRecords("kkr", [
  ["ajinkya-rahane", "Ajinkya Rahane", false],
  ["angkrish-raghuvanshi", "Angkrish Raghuvanshi", false],
  ["anukul-roy", "Anukul Roy", false],
  ["harshit-rana", "Harshit Rana", false],
  ["manish-pandey", "Manish Pandey", false],
  ["ramandeep-singh", "Ramandeep Singh", false],
  ["rinku-singh", "Rinku Singh", false],
  ["rovman-powell", "Rovman Powell", true],
  ["sunil-narine", "Sunil Narine", true],
  ["umran-malik", "Umran Malik", false],
  ["vaibhav-arora", "Vaibhav Arora", false],
  ["varun-chakaravarthy", "Varun Chakaravarthy", false],
]);

// 3. LUCKNOW SUPER GIANTS

export const LSG_RETAINED_PLAYERS_2026 = createTeamRecords("lsg", [
  ["abdul-samad", "Abdul Samad", false],
  ["aiden-markram", "Aiden Markram", true],
  ["akash-singh", "Akash Singh", false],
  ["arjun-tendulkar", "Arjun Tendulkar", false],
  ["arshin-kulkarni", "Arshin Kulkarni", false],
  ["avesh-khan", "Avesh Khan", false],
  ["ayush-badoni", "Ayush Badoni", false],
  ["digvesh-rathi", "Digvesh Rathi", false],
  ["himmat-singh", "Himmat Singh", false],
  ["manimaran-siddharth", "Manimaran Siddharth", false],
  ["matthew-breetzke", "Matthew Breetzke", true],
  ["mayank-yadav", "Mayank Yadav", false],
  ["mohammed-shami", "Mohammed Shami", false],
  ["mitchell-marsh", "Mitchell Marsh", true],
  ["mohsin-khan", "Mohsin Khan", false],
  ["nicholas-pooran", "Nicholas Pooran", true],
  ["prince-yadav", "Prince Yadav", false],
  ["rishabh-pant", "Rishabh Pant", false],
  ["shahbaz-ahmed", "Shahbaz Ahmed", false],
]);

// 4. MUMBAI INDIANS

export const MI_RETAINED_PLAYERS_2026 = createTeamRecords("mi", [
  ["allah-ghazanfar", "Allah Ghazanfar", true],
  ["ashwani-kumar", "Ashwani Kumar", false],
  ["corbin-bosch", "Corbin Bosch", true],
  ["deepak-chahar", "Deepak Chahar", false],
  ["hardik-pandya", "Hardik Pandya", false],
  ["jasprit-bumrah", "Jasprit Bumrah", false],
  ["mayank-markande", "Mayank Markande", false],
  ["mitchell-santner", "Mitchell Santner", true],
  ["naman-dhir", "Naman Dhir", false],
  ["raghu-sharma", "Raghu Sharma", false],
  ["raj-angad-bawa", "Raj Angad Bawa", false],
  ["robin-minz", "Robin Minz", false],
  ["rohit-sharma", "Rohit Sharma", false],
  ["ryan-rickelton", "Ryan Rickelton", true],
  ["shardul-thakur", "Shardul Thakur", false],
  ["sherfane-rutherford", "Sherfane Rutherford", true],
  ["suryakumar-yadav", "Suryakumar Yadav", false],
  ["tilak-varma", "Tilak Varma", false],
  ["trent-boult", "Trent Boult", true],
  ["will-jacks", "Will Jacks", true],
]);

// 5. PUNJAB KINGS

export const PBKS_RETAINED_PLAYERS_2026 = createTeamRecords("pbks", [
  ["arshdeep-singh", "Arshdeep Singh", false],
  ["azmatullah-omarzai", "Azmatullah Omarzai", true],
  ["harnoor-pannu", "Harnoor Pannu", false],
  ["harpreet-brar", "Harpreet Brar", false],
  ["lockie-ferguson", "Lockie Ferguson", true],
  ["marco-jansen", "Marco Jansen", true],
  ["marcus-stoinis", "Marcus Stoinis", true],
  ["mitch-owen", "Mitch Owen", true],
  ["musheer-khan", "Musheer Khan", false],
  ["nehal-wadhera", "Nehal Wadhera", false],
  ["prabhsimran-singh", "Prabhsimran Singh", false],
  ["priyansh-arya", "Priyansh Arya", false],
  ["pyla-avinash", "Pyla Avinash", false],
  ["shashank-singh", "Shashank Singh", false],
  ["shreyas-iyer", "Shreyas Iyer", false],
  ["suryansh-shedge", "Suryansh Shedge", false],
  ["vishnu-vinod", "Vishnu Vinod", false],
  ["vyshak-vijaykumar", "Vyshak Vijaykumar", false],
  ["xavier-bartlett", "Xavier Bartlett", true],
  ["yash-thakur", "Yash Thakur", false],
  ["yuzvendra-chahal", "Yuzvendra Chahal", false],
]);

// 6. RAJASTHAN ROYALS

export const RR_RETAINED_PLAYERS_2026 = createTeamRecords("rr", [
  ["dhruv-jurel", "Dhruv Jurel", false],
  ["donovan-ferreira", "Donovan Ferreira", true],
  ["jofra-archer", "Jofra Archer", true],
  ["kwena-maphaka", "Kwena Maphaka", true],
  ["lhuan-dre-pretorius", "Lhuan-Dre Pretorius", true],
  ["nandre-burger", "Nandre Burger", true],
  ["ravindra-jadeja", "Ravindra Jadeja", false],
  ["riyan-parag", "Riyan Parag", false],
  ["sam-curran", "Sam Curran", true],
  ["sandeep-sharma", "Sandeep Sharma", false],
  ["shimron-hetmyer", "Shimron Hetmyer", true],
  ["shubham-dubey", "Shubham Dubey", false],
  ["tushar-deshpande", "Tushar Deshpande", false],
  ["vaibhav-suryavanshi", "Vaibhav Suryavanshi", false],
  ["yashasvi-jaiswal", "Yashasvi Jaiswal", false],
  ["yudhvir-charak", "Yudhvir Charak", false],
]);

// 7. ROYAL CHALLENGERS BENGALURU

export const RCB_RETAINED_PLAYERS_2026 = createTeamRecords("rcb", [
  ["abhinandan-singh", "Abhinandan Singh", false],
  ["bhuvneshwar-kumar", "Bhuvneshwar Kumar", false],
  ["devdutt-padikkal", "Devdutt Padikkal", false],
  ["jacob-bethell", "Jacob Bethell", true],
  ["jitesh-sharma", "Jitesh Sharma", false],
  ["josh-hazlewood", "Josh Hazlewood", true],
  ["krunal-pandya", "Krunal Pandya", false],
  ["nuwan-thushara", "Nuwan Thushara", true],
  ["phil-salt", "Phil Salt", true],
  ["rajat-patidar", "Rajat Patidar", false],
  ["rasikh-dar", "Rasikh Dar", false],
  ["romario-shepherd", "Romario Shepherd", true],
  ["suyash-sharma", "Suyash Sharma", false],
  ["swapnil-singh", "Swapnil Singh", false],
  ["tim-david", "Tim David", true],
  ["virat-kohli", "Virat Kohli", false],
  ["yash-dayal", "Yash Dayal", false],
]);

// 8. SUNRISERS HYDERABAD

export const SRH_RETAINED_PLAYERS_2026 = createTeamRecords("srh", [
  ["abhishek-sharma", "Abhishek Sharma", false],
  ["aniket-verma", "Aniket Verma", false],
  ["brydon-carse", "Brydon Carse", true],
  ["eshan-malinga", "Eshan Malinga", true],
  ["harsh-dubey", "Harsh Dubey", false],
  ["harshal-patel", "Harshal Patel", false],
  ["heinrich-klaasen", "Heinrich Klaasen", true],
  ["ishan-kishan", "Ishan Kishan", false],
  ["jaydev-unadkat", "Jaydev Unadkat", false],
  ["kamindu-mendis", "Kamindu Mendis", true],
  ["nitish-kumar-reddy", "Nitish Kumar Reddy", false],
  ["pat-cummins", "Pat Cummins", true],
  ["smaran-ravichandaran", "Smaran Ravichandaran", false],
  ["travis-head", "Travis Head", true],
  ["zeeshan-ansari", "Zeeshan Ansari", false],
]);

// Consolidated collection of these eight franchises.

export const OTHER_IPL_RETAINED_PLAYERS_2026: IPLRetainedPlayerRecord[] = [
  ...GT_RETAINED_PLAYERS_2026,
  ...KKR_RETAINED_PLAYERS_2026,
  ...LSG_RETAINED_PLAYERS_2026,
  ...MI_RETAINED_PLAYERS_2026,
  ...PBKS_RETAINED_PLAYERS_2026,
  ...RR_RETAINED_PLAYERS_2026,
  ...RCB_RETAINED_PLAYERS_2026,
  ...SRH_RETAINED_PLAYERS_2026,
];
