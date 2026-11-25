
import type { IPLFixture } from "./tournamentEngine";

export interface IPLVenue {
  id: string;
  name: string;
  city: string;
  capacity: number;
}

export interface ScheduledIPLMatch extends IPLFixture {
  matchDay: number;
  scheduledDate: string;
  startTime: string;
  venueId: string;
  venueName: string;
}

export interface IPLScheduleConfig {
  startDate: string;
  matchesPerDay: number;
  daysBetweenMatchDays: number;
  startTime: string;
  venues: IPLVenue[];
}

export interface IPLScheduleResult {
  matches: ScheduledIPLMatch[];
  totalMatchDays: number;
  totalMatches: number;
  startDate: string;
  endDate: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(date: string): Date {
  const parsed = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid schedule date: ${date}`);
  }

  return parsed;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function validateConfig(config: IPLScheduleConfig): void {
  if (!Number.isInteger(config.matchesPerDay) ||
      config.matchesPerDay < 1 ||
      config.matchesPerDay > 2) {
    throw new Error("Matches per day must be 1 or 2.");
  }

  if (!Number.isInteger(config.daysBetweenMatchDays) ||
      config.daysBetweenMatchDays < 1) {
    throw new Error("Days between match days must be at least 1.");
  }

  if (config.venues.length === 0) {
    throw new Error("At least one venue is required.");
  }

  if (new Set(config.venues.map((venue) => venue.id)).size !==
      config.venues.length) {
    throw new Error("Venue IDs must be unique.");
  }

  if (!/^\d{2}:\d{2}$/.test(config.startTime)) {
    throw new Error("Start time must use HH:MM format.");
  }

  const [hours, minutes] = config.startTime.split(":").map(Number);

  if (hours > 23 || minutes > 59) {
    throw new Error("Invalid match start time.");
  }

  parseDate(config.startDate);
}

function hasTeamConflict(
  scheduled: ScheduledIPLMatch[],
  fixture: IPLFixture,
  date: string,
): boolean {
  return scheduled.some(
    (match) =>
      match.scheduledDate === date &&
      (
        match.homeTeamId === fixture.homeTeamId ||
        match.homeTeamId === fixture.awayTeamId ||
        match.awayTeamId === fixture.homeTeamId ||
        match.awayTeamId === fixture.awayTeamId
      ),
  );
}

export function generateMatchSchedule(
  fixtures: readonly IPLFixture[],
  config: IPLScheduleConfig,
): IPLScheduleResult {
  validateConfig(config);

  const start = parseDate(config.startDate);
  const scheduled: ScheduledIPLMatch[] = [];

  let matchDay = 0;
  let venueIndex = 0;
  let fixtureIndex = 0;

  while (fixtureIndex < fixtures.length) {
    matchDay++;

    const date = formatDate(
      addDays(
        start,
        (matchDay - 1) * config.daysBetweenMatchDays,
      ),
    );

    let matchesScheduledToday = 0;

    for (
      let index = fixtureIndex;
      index < fixtures.length &&
      matchesScheduledToday < config.matchesPerDay;
      index++
    ) {
      const fixture = fixtures[index];

      if (hasTeamConflict(scheduled, fixture, date)) {
        continue;
      }

      const venue = config.venues[
        venueIndex % config.venues.length
      ];

      scheduled.push({
        ...fixture,
        matchDay,
        scheduledDate: date,
        startTime: config.startTime,
        venueId: venue.id,
        venueName: venue.name,
      });

      venueIndex++;
      matchesScheduledToday++;
    }

    if (matchesScheduledToday === 0) {
      throw new Error(
        "Unable to schedule remaining fixtures without team conflicts.",
      );
    }

    fixtureIndex = fixtures.length;

    const scheduledIds = new Set(
      scheduled.map((match) => match.id),
    );

    const remaining = fixtures.filter(
      (fixture) => !scheduledIds.has(fixture.id),
    );

    if (remaining.length === fixtures.length - scheduled.length) {
      throw new Error("Schedule generation made no progress.");
    }

    // Continue with fixtures not yet scheduled.
    const nextFixture = remaining[0];

    if (nextFixture) {
      fixtureIndex = fixtures.indexOf(nextFixture);
    }
  }

  const sortedMatches = [...scheduled].sort(
    (a, b) =>
      a.matchDay - b.matchDay ||
      a.matchNumber - b.matchNumber,
  );

  return {
    matches: sortedMatches,
    totalMatchDays: matchDay,
    totalMatches: sortedMatches.length,
    startDate: sortedMatches[0]?.scheduledDate ?? config.startDate,
    endDate:
      sortedMatches[sortedMatches.length - 1]?.scheduledDate ??
      config.startDate,
  };
}

export function getMatchesForDate(
  matches: readonly ScheduledIPLMatch[],
  date: string,
): ScheduledIPLMatch[] {
  return matches.filter(
    (match) => match.scheduledDate === date,
  );
}

export function getMatchesForFranchise(
  matches: readonly ScheduledIPLMatch[],
  franchiseId: string,
): ScheduledIPLMatch[] {
  return matches.filter(
    (match) =>
      match.homeTeamId === franchiseId ||
      match.awayTeamId === franchiseId,
  );
}

export function getNextScheduledMatch(
  matches: readonly ScheduledIPLMatch[],
): ScheduledIPLMatch | null {
  return (
    [...matches]
      .filter((match) => match.status === "scheduled")
      .sort(
        (a, b) =>
          a.scheduledDate.localeCompare(b.scheduledDate) ||
          a.matchNumber - b.matchNumber,
      )[0] ?? null
  );
}

export function getVenueSchedule(
  matches: readonly ScheduledIPLMatch[],
  venueId: string,
): ScheduledIPLMatch[] {
  return matches
    .filter((match) => match.venueId === venueId)
    .sort(
      (a, b) =>
        a.scheduledDate.localeCompare(b.scheduledDate) ||
        a.matchNumber - b.matchNumber,
    );
}
