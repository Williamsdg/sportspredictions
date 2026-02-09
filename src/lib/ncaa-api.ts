// NCAA API Service
// Docs: https://github.com/henrygd/ncaa-api

const BASE_URL = "https://ncaa-api.henrygd.me";

export interface NcaaGame {
  game: {
    gameID: string;
    startDate: string;
    startTime: string;
    startTimeEpoch: number;
    gameState: string; // "live", "final", "pre"
    currentPeriod?: string;
    finalMessage?: string;
    home: {
      score?: string;
      names: {
        char6: string;
        short: string;
        seo: string;
        full: string;
      };
      winner?: boolean;
      conferences?: { conferenceName: string }[];
    };
    away: {
      score?: string;
      names: {
        char6: string;
        short: string;
        seo: string;
        full: string;
      };
      winner?: boolean;
      conferences?: { conferenceName: string }[];
    };
  };
}

export interface NcaaScoreboardResponse {
  games: NcaaGame[];
}

export interface NcaaScheduleResponse {
  dates: {
    date: string;
    games: number;
  }[];
}

// Fetch football scoreboard for a specific week
export async function getFootballScoreboard(
  year: number,
  week: number,
  conference: string = "all-conf"
): Promise<NcaaScoreboardResponse | null> {
  try {
    const url = `${BASE_URL}/scoreboard/football/fbs/${year}/${week}/${conference}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching football scoreboard:", error);
    return null;
  }
}

// Fetch basketball schedule for a month (returns dates with games)
export async function getBasketballSchedule(
  year: number,
  month: number
): Promise<NcaaScheduleResponse | null> {
  try {
    const monthStr = month.toString().padStart(2, "0");
    const url = `${BASE_URL}/schedule/basketball-men/d1/${year}/${monthStr}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching basketball schedule:", error);
    return null;
  }
}

// Fetch basketball scoreboard for a specific date
export async function getBasketballScoreboard(
  year: number,
  month: number,
  day: number
): Promise<NcaaScoreboardResponse | null> {
  try {
    const monthStr = month.toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const url = `${BASE_URL}/scoreboard/basketball-men/d1/${year}/${monthStr}/${dayStr}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching basketball scoreboard:", error);
    return null;
  }
}

// Get detailed game info
export async function getGameDetails(gameId: string) {
  try {
    const url = `${BASE_URL}/game/${gameId}/boxscore`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching game details:", error);
    return null;
  }
}

// Helper to parse game state
export function parseGameState(game: NcaaGame["game"]): {
  status: "SCHEDULED" | "IN_PROGRESS" | "FINAL";
  homeScore: number | null;
  awayScore: number | null;
} {
  const homeScore = game.home.score ? parseInt(game.home.score) : null;
  const awayScore = game.away.score ? parseInt(game.away.score) : null;

  let status: "SCHEDULED" | "IN_PROGRESS" | "FINAL" = "SCHEDULED";
  if (game.gameState === "final") {
    status = "FINAL";
  } else if (game.gameState === "live") {
    status = "IN_PROGRESS";
  }

  return { status, homeScore, awayScore };
}

// Map NCAA team name to our abbreviation
export function mapTeamName(ncaaName: string): string {
  // Common mappings - extend as needed
  const mappings: Record<string, string> = {
    // SEC
    "alabama": "ALA",
    "arkansas": "ARK",
    "auburn": "AUB",
    "florida": "FLA",
    "georgia": "UGA",
    "kentucky": "UK",
    "lsu": "LSU",
    "mississippi-st": "MSST",
    "missouri": "MIZ",
    "oklahoma": "OU",
    "ole-miss": "MISS",
    "south-carolina": "SC",
    "tennessee": "TENN",
    "texas": "TEX",
    "texas-am": "TAMU",
    "vanderbilt": "VAN",
    // Big Ten
    "illinois": "ILL",
    "indiana": "IND",
    "iowa": "IOWA",
    "maryland": "MD",
    "michigan": "MICH",
    "michigan-st": "MSU",
    "minnesota": "MINN",
    "nebraska": "NEB",
    "northwestern": "NW",
    "ohio-st": "OSU",
    "oregon": "ORE",
    "penn-st": "PSU",
    "purdue": "PUR",
    "rutgers": "RUT",
    "ucla": "UCLA",
    "usc": "USC",
    "washington": "WASH",
    "wisconsin": "WIS",
    // Big 12
    "arizona": "ARIZ",
    "arizona-st": "ASU",
    "baylor": "BAY",
    "byu": "BYU",
    "cincinnati": "CIN",
    "colorado": "COLO",
    "houston": "HOU",
    "iowa-st": "ISU",
    "kansas": "KU",
    "kansas-st": "KSU",
    "oklahoma-st": "OKST",
    "tcu": "TCU",
    "texas-tech": "TTU",
    "ucf": "UCF",
    "utah": "UTAH",
    "west-virginia": "WVU",
    // ACC
    "boston-college": "BC",
    "california": "CAL",
    "clemson": "CLEM",
    "duke": "DUKE",
    "florida-st": "FSU",
    "georgia-tech": "GT",
    "louisville": "LOU",
    "miami-fl": "MIA",
    "nc-state": "NCST",
    "north-carolina": "UNC",
    "notre-dame": "ND",
    "pittsburgh": "PITT",
    "smu": "SMU",
    "stanford": "STAN",
    "syracuse": "SYR",
    "virginia": "UVA",
    "virginia-tech": "VT",
    "wake-forest": "WAKE",
    // Big East (Basketball)
    "butler": "BUT",
    "uconn": "CONN",
    "creighton": "CREI",
    "depaul": "DEP",
    "georgetown": "GTWN",
    "marquette": "MARQ",
    "providence": "PROV",
    "st-johns": "SJU",
    "seton-hall": "HALL",
    "villanova": "NOVA",
    "xavier": "XAV",
    // WCC
    "gonzaga": "GONZ",
    "saint-marys-ca": "SMC",
    "pepperdine": "PEPP",
  };

  const key = ncaaName.toLowerCase().replace(/\s+/g, "-");
  return mappings[key] || ncaaName.toUpperCase().substring(0, 4);
}
