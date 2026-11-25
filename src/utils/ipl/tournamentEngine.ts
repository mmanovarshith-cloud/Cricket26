
export interface IPLTeamStanding {
  franchiseId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  netRunRate: number;
  position: number;
}

export interface IPLFixture {
  id: string;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  stage:
    | "league"
    | "qualifier-1"
    | "eliminator"
    | "qualifier-2"
    | "final";
  status: "scheduled" | "completed";
  winnerId: string | null;
  noResult: boolean;
}

export interface IPLTournament {
  season: number;
  franchiseIds: string[];
  fixtures: IPLFixture[];
  standings: IPLTeamStanding[];
  currentFixtureIndex: number;
  completedMatches: number;
}

export interface IPLMatchResult {
  fixtureId: string;
  winnerId: string | null;
  noResult?: boolean;
  homeRuns: number;
  homeOvers: number;
  awayRuns: number;
  awayOvers: number;
  homeAllOut?: boolean;
  awayAllOut?: boolean;
}

export interface IPLPlayoffQualification {
  qualifier1: [string, string];
  eliminator: [string, string];
  qualifier2: [string, string];
  final: [string, string];
}

function createEmptyStanding(
  franchiseId: string,
): IPLTeamStanding {
  return {
    franchiseId,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    noResult: 0,
    points: 0,
    runsScored: 0,
    oversFaced: 0,
    runsConceded: 0,
    oversBowled: 0,
    netRunRate: 0,
    position: 0,
  };
}

function calculateNetRunRate(
  runsScored: number,
  oversFaced: number,
  runsConceded: number,
  oversBowled: number,
): number {
  if (oversFaced <= 0 || oversBowled <= 0) {
    return 0;
  }

  const runRateFor = runsScored / oversFaced;
  const runRateAgainst = runsConceded / oversBowled;

  return Number((runRateFor - runRateAgainst).toFixed(3));
}

function validateFranchises(franchiseIds: string[]): void {
  if (franchiseIds.length !== 10) {
    throw new Error("This IPL tournament requires exactly 10 franchises.");
  }

  if (new Set(franchiseIds).size !== franchiseIds.length) {
    throw new Error("Franchise IDs must be unique.");
  }
}

export function generateLeagueSchedule(
  franchiseIds: string[],
  season: number,
): IPLFixture[] {
  validateFranchises(franchiseIds);

  const teams = [...franchiseIds];
  const fixedTeam = teams[0];
  const rotatingTeams = teams.slice(1);

  const fixtures: IPLFixture[] = [];
  let matchNumber = 1;

  for (let round = 0; round < 9; round++) {
    const roundTeams = [fixedTeam, ...rotatingTeams];

    for (let i = 0; i < 5; i++) {
      const first = roundTeams[i];
      const second = roundTeams[9 - i];

      const homeTeamId =
        round % 2 === 0 ? first : second;

      const awayTeamId =
        round % 2 === 0 ? second : first;

      fixtures.push({
        id: `IPL-${season}-${matchNumber}`,
        matchNumber,
        homeTeamId,
        awayTeamId,
        stage: "league",
        status: "scheduled",
        winnerId: null,
        noResult: false,
      });

      matchNumber++;
    }

    rotatingTeams.unshift(rotatingTeams.pop()!);
  }

  const firstLeg = fixtures.map((fixture) => ({
    ...fixture,
    id: `${fixture.id}-R1`,
  }));

  const secondLeg = firstLeg.map((fixture) => ({
    ...fixture,
    id: `${fixture.id}-R2`,
    matchNumber: matchNumber++,
    homeTeamId: fixture.awayTeamId,
    awayTeamId: fixture.homeTeamId,
  }));

  return [...firstLeg, ...secondLeg];
}

export function createIPLTournament(
  franchiseIds: string[],
  season: number,
): IPLTournament {
  validateFranchises(franchiseIds);

  return {
    season,
    franchiseIds: [...franchiseIds],
    fixtures: generateLeagueSchedule(franchiseIds, season),
    standings: franchiseIds.map(createEmptyStanding),
    currentFixtureIndex: 0,
    completedMatches: 0,
  };
}

function getOversForNRR(
  overs: number,
  allOut: boolean | undefined,
): number {
  // An all-out innings is counted as the full allotted overs
  // when calculating tournament net run rate.
  return allOut ? 20 : overs;
}

export function recordLeagueMatchResult(
  tournament: IPLTournament,
  result: IPLMatchResult,
): IPLTournament {
  const fixtureIndex = tournament.fixtures.findIndex(
    (fixture) => fixture.id === result.fixtureId,
  );

  if (fixtureIndex === -1) {
    throw new Error("Fixture not found.");
  }

  const fixture = tournament.fixtures[fixtureIndex];

  if (fixture.stage !== "league") {
    throw new Error("This function only records league matches.");
  }

  if (fixture.status === "completed") {
    throw new Error("This match has already been completed.");
  }

  if (
    !Number.isFinite(result.homeRuns) ||
    !Number.isFinite(result.awayRuns) ||
    result.homeRuns < 0 ||
    result.awayRuns < 0 ||
    !Number.isFinite(result.homeOvers) ||
    !Number.isFinite(result.awayOvers) ||
    result.homeOvers <= 0 ||
    result.awayOvers <= 0 ||
    result.homeOvers > 20 ||
    result.awayOvers > 20
  ) {
    throw new Error("Invalid match score or overs.");
  }

  if (
    !result.noResult &&
    result.winnerId !== fixture.homeTeamId &&
    result.winnerId !== fixture.awayTeamId
  ) {
    throw new Error("Winner must be one of the two playing franchises.");
  }

  if (result.noResult && result.winnerId !== null) {
    throw new Error("A no-result match cannot have a winner.");
  }

  const standings = tournament.standings.map(
    (standing) => ({ ...standing }),
  );

  const home = standings.find(
    (standing) => standing.franchiseId === fixture.homeTeamId,
  );

  const away = standings.find(
    (standing) => standing.franchiseId === fixture.awayTeamId,
  );

  if (!home || !away) {
    throw new Error("Fixture franchises are missing from standings.");
  }

  home.played++;
  away.played++;

  if (result.noResult) {
    home.noResult++;
    away.noResult++;
    home.points += 1;
    away.points += 1;
  } else {
    if (result.winnerId === home.franchiseId) {
      home.won++;
      home.points += 2;
      away.lost++;
    } else if (result.winnerId === away.franchiseId) {
      away.won++;
      away.points += 2;
      home.lost++;
    } else {
      home.tied++;
      away.tied++;
      home.points += 1;
      away.points += 1;
    }

    const homeOvers = getOversForNRR(
      result.homeOvers,
      result.homeAllOut,
    );

    const awayOvers = getOversForNRR(
      result.awayOvers,
      result.awayAllOut,
    );

    home.runsScored += result.homeRuns;
    home.oversFaced += homeOvers;
    home.runsConceded += result.awayRuns;
    home.oversBowled += awayOvers;

    away.runsScored += result.awayRuns;
    away.oversFaced += awayOvers;
    away.runsConceded += result.homeRuns;
    away.oversBowled += homeOvers;
  }

  for (const standing of standings) {
    standing.netRunRate = calculateNetRunRate(
      standing.runsScored,
      standing.oversFaced,
      standing.runsConceded,
      standing.oversBowled,
    );
  }

  standings.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    return b.netRunRate - a.netRunRate;
  });

  standings.forEach((standing, index) => {
    standing.position = index + 1;
  });

  const fixtures = tournament.fixtures.map((item, index) =>
    index === fixtureIndex
      ? {
          ...item,
          status: "completed" as const,
          winnerId: result.winnerId,
          noResult: Boolean(result.noResult),
        }
      : item,
  );

  return {
    ...tournament,
    fixtures,
    standings,
    completedMatches: tournament.completedMatches + 1,
  };
}

export function getPlayoffQualification(
  tournament: IPLTournament,
): IPLPlayoffQualification {
  const leagueMatches = tournament.fixtures.filter(
    (fixture) => fixture.stage === "league",
  );

  if (leagueMatches.some((fixture) => fixture.status !== "completed")) {
    throw new Error("All league matches must finish before playoffs.");
  }

  const topFour = [...tournament.standings]
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return b.netRunRate - a.netRunRate;
    })
    .slice(0, 4);

  if (topFour.length !== 4) {
    throw new Error("Four qualified franchises are required.");
  }

  const [first, second, third, fourth] = topFour.map(
    (standing) => standing.franchiseId,
  );

  return {
    qualifier1: [first, second],
    eliminator: [third, fourth],
    qualifier2: ["", ""],
    final: ["", ""],
  };
}

export function resolvePlayoffResults(
  qualification: IPLPlayoffQualification,
  results: {
    qualifier1Winner: string;
    eliminatorWinner: string;
    qualifier2Winner: string;
  },
): IPLPlayoffQualification {
  const [first, second] = qualification.qualifier1;
  const [third, fourth] = qualification.eliminator;

  if (
    results.qualifier1Winner !== first &&
    results.qualifier1Winner !== second
  ) {
    throw new Error("Invalid Qualifier 1 winner.");
  }

  if (
    results.eliminatorWinner !== third &&
    results.eliminatorWinner !== fourth
  ) {
    throw new Error("Invalid Eliminator winner.");
  }

  const qualifier2Teams = [
    results.qualifier1Winner === first ? second : first,
    results.eliminatorWinner,
  ];

  if (!qualifier2Teams.includes(results.qualifier2Winner)) {
    throw new Error("Invalid Qualifier 2 winner.");
  }

  return {
    ...qualification,
    qualifier2: qualifier2Teams as [string, string],
    final: [
      results.qualifier1Winner,
      results.qualifier2Winner,
    ],
  };
}
