// Script to sync scores from NCAA API
// Run with: npx tsx scripts/sync-scores.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = "https://ncaa-api.henrygd.me";

interface NcaaGame {
  game: {
    gameID: string;
    startTimeEpoch: number;
    gameState: string;
    home: {
      score?: string;
      names: { seo: string };
    };
    away: {
      score?: string;
      names: { seo: string };
    };
  };
}

// Team name mappings
const TEAM_MAPPINGS: Record<string, string> = {
  "alabama": "ALA", "arkansas": "ARK", "auburn": "AUB", "florida": "FLA",
  "georgia": "UGA", "kentucky": "UK", "lsu": "LSU", "mississippi-st": "MSST",
  "missouri": "MIZ", "oklahoma": "OU", "ole-miss": "MISS", "south-carolina": "SC",
  "tennessee": "TENN", "texas": "TEX", "texas-am": "TAMU", "vanderbilt": "VAN",
  "illinois": "ILL", "indiana": "IND", "iowa": "IOWA", "maryland": "MD",
  "michigan": "MICH", "michigan-st": "MSU", "minnesota": "MINN", "nebraska": "NEB",
  "northwestern": "NW", "ohio-st": "OSU", "oregon": "ORE", "penn-st": "PSU",
  "purdue": "PUR", "rutgers": "RUT", "ucla": "UCLA", "usc": "USC",
  "washington": "WASH", "wisconsin": "WIS", "arizona": "ARIZ", "arizona-st": "ASU",
  "baylor": "BAY", "byu": "BYU", "cincinnati": "CIN", "colorado": "COLO",
  "houston": "HOU", "iowa-st": "ISU", "kansas": "KU", "kansas-st": "KSU",
  "oklahoma-st": "OKST", "tcu": "TCU", "texas-tech": "TTU", "ucf": "UCF",
  "utah": "UTAH", "west-virginia": "WVU", "boston-college": "BC", "california": "CAL",
  "clemson": "CLEM", "duke": "DUKE", "florida-st": "FSU", "georgia-tech": "GT",
  "louisville": "LOU", "miami-fl": "MIA", "nc-state": "NCST", "north-carolina": "UNC",
  "notre-dame": "ND", "pittsburgh": "PITT", "smu": "SMU", "stanford": "STAN",
  "syracuse": "SYR", "virginia": "UVA", "virginia-tech": "VT", "wake-forest": "WAKE",
  "butler": "BUT", "uconn": "CONN", "creighton": "CREI", "depaul": "DEP",
  "georgetown": "GTWN", "marquette": "MARQ", "providence": "PROV", "st-johns": "SJU",
  "seton-hall": "HALL", "villanova": "NOVA", "xavier": "XAV",
  "gonzaga": "GONZ", "saint-marys-ca": "SMC", "pepperdine": "PEPP",
};

function mapTeamName(seo: string): string {
  return TEAM_MAPPINGS[seo.toLowerCase()] || seo.toUpperCase().substring(0, 4);
}

async function syncBasketballDate(year: number, month: number, day: number) {
  const monthStr = month.toString().padStart(2, "0");
  const dayStr = day.toString().padStart(2, "0");
  const url = `${BASE_URL}/scoreboard/basketball-men/d1/${year}/${monthStr}/${dayStr}`;

  console.log(`Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`No data for ${year}-${monthStr}-${dayStr}`);
    return { synced: 0, skipped: 0 };
  }

  const data = await res.json();
  if (!data.games?.length) {
    console.log(`No games for ${year}-${monthStr}-${dayStr}`);
    return { synced: 0, skipped: 0 };
  }

  const sport = await prisma.sport.findUnique({ where: { slug: "basketball" } });
  const season = await prisma.season.findFirst({
    where: { sportId: sport!.id, isActive: true },
  });
  const teams = await prisma.team.findMany({ where: { sportId: sport!.id } });
  const teamMap = new Map(teams.map((t) => [t.abbreviation, t]));

  let synced = 0;
  let skipped = 0;

  for (const { game } of data.games as NcaaGame[]) {
    const homeAbbr = mapTeamName(game.home.names.seo);
    const awayAbbr = mapTeamName(game.away.names.seo);

    const homeTeam = teamMap.get(homeAbbr);
    const awayTeam = teamMap.get(awayAbbr);

    if (!homeTeam || !awayTeam) {
      skipped++;
      continue;
    }

    const homeScore = game.home.score ? parseInt(game.home.score) : null;
    const awayScore = game.away.score ? parseInt(game.away.score) : null;
    const status = game.gameState === "final" ? "FINAL" :
                   game.gameState === "live" ? "IN_PROGRESS" : "SCHEDULED";

    await prisma.game.upsert({
      where: { externalId: game.gameID },
      update: { homeScore, awayScore, status },
      create: {
        externalId: game.gameID,
        sportId: sport!.id,
        seasonId: season!.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        gameTime: new Date(game.startTimeEpoch * 1000),
        week: 1,
        homeScore,
        awayScore,
        status,
      },
    });
    synced++;
  }

  console.log(`  Synced: ${synced}, Skipped: ${skipped}`);
  return { synced, skipped };
}

async function main() {
  const args = process.argv.slice(2);
  const sport = args[0] || "basketball";

  if (sport === "basketball") {
    // Sync today and yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    console.log("\n=== Syncing Basketball Scores ===\n");

    await syncBasketballDate(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate()
    );

    await syncBasketballDate(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
  }

  console.log("\n✅ Sync complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
