import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getFootballScoreboard,
  getBasketballScoreboard,
  parseGameState,
  mapTeamName,
} from "@/lib/ncaa-api";

export const dynamic = "force-dynamic";

// Sync games from NCAA API
export async function POST(request: Request) {
  try {
    const { sport, year, week, month, day } = await request.json();

    if (sport === "football") {
      return await syncFootball(year, week);
    } else if (sport === "basketball") {
      return await syncBasketball(year, month, day);
    }

    return NextResponse.json({ error: "Invalid sport" }, { status: 400 });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

async function syncFootball(year: number, week: number) {
  const data = await getFootballScoreboard(year, week);
  if (!data) {
    return NextResponse.json({ error: "Failed to fetch NCAA data" }, { status: 500 });
  }

  const sport = await prisma.sport.findUnique({ where: { slug: "football" } });
  if (!sport) {
    return NextResponse.json({ error: "Football sport not found" }, { status: 404 });
  }

  const season = await prisma.season.findFirst({
    where: { sportId: sport.id, isActive: true },
  });
  if (!season) {
    return NextResponse.json({ error: "No active season" }, { status: 404 });
  }

  const teams = await prisma.team.findMany({ where: { sportId: sport.id } });
  const teamMap = new Map(teams.map((t) => [t.abbreviation, t]));

  let synced = 0;
  let skipped = 0;

  for (const { game } of data.games) {
    const homeAbbr = mapTeamName(game.home.names.seo);
    const awayAbbr = mapTeamName(game.away.names.seo);

    const homeTeam = teamMap.get(homeAbbr);
    const awayTeam = teamMap.get(awayAbbr);

    if (!homeTeam || !awayTeam) {
      skipped++;
      continue;
    }

    const { status, homeScore, awayScore } = parseGameState(game);
    const gameTime = new Date(game.startTimeEpoch * 1000);

    await prisma.game.upsert({
      where: { externalId: game.gameID },
      update: {
        homeScore,
        awayScore,
        status,
      },
      create: {
        externalId: game.gameID,
        sportId: sport.id,
        seasonId: season.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        gameTime,
        week,
        homeScore,
        awayScore,
        status,
      },
    });
    synced++;
  }

  return NextResponse.json({
    success: true,
    synced,
    skipped,
    total: data.games.length,
  });
}

async function syncBasketball(year: number, month: number, day: number) {
  const data = await getBasketballScoreboard(year, month, day);
  if (!data) {
    return NextResponse.json({ error: "Failed to fetch NCAA data" }, { status: 500 });
  }

  const sport = await prisma.sport.findUnique({ where: { slug: "basketball" } });
  if (!sport) {
    return NextResponse.json({ error: "Basketball sport not found" }, { status: 404 });
  }

  const season = await prisma.season.findFirst({
    where: { sportId: sport.id, isActive: true },
  });
  if (!season) {
    return NextResponse.json({ error: "No active season" }, { status: 404 });
  }

  const teams = await prisma.team.findMany({ where: { sportId: sport.id } });
  const teamMap = new Map(teams.map((t) => [t.abbreviation, t]));

  let synced = 0;
  let skipped = 0;

  for (const { game } of data.games) {
    const homeAbbr = mapTeamName(game.home.names.seo);
    const awayAbbr = mapTeamName(game.away.names.seo);

    const homeTeam = teamMap.get(homeAbbr);
    const awayTeam = teamMap.get(awayAbbr);

    if (!homeTeam || !awayTeam) {
      skipped++;
      continue;
    }

    const { status, homeScore, awayScore } = parseGameState(game);
    const gameTime = new Date(game.startTimeEpoch * 1000);

    await prisma.game.upsert({
      where: { externalId: game.gameID },
      update: {
        homeScore,
        awayScore,
        status,
      },
      create: {
        externalId: game.gameID,
        sportId: sport.id,
        seasonId: season.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        gameTime,
        week: 1, // Basketball doesn't have weeks
        homeScore,
        awayScore,
        status,
      },
    });
    synced++;
  }

  return NextResponse.json({
    success: true,
    synced,
    skipped,
    total: data.games.length,
  });
}

// GET endpoint to check sync status or trigger update for scores only
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");

  if (!sport) {
    return NextResponse.json({ error: "Sport required" }, { status: 400 });
  }

  // Update scores for games in progress or recently completed
  const sportRecord = await prisma.sport.findUnique({ where: { slug: sport } });
  if (!sportRecord) {
    return NextResponse.json({ error: "Sport not found" }, { status: 404 });
  }

  // Get games from today that might need score updates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const games = await prisma.game.findMany({
    where: {
      sportId: sportRecord.id,
      gameTime: {
        gte: today,
        lt: tomorrow,
      },
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
    },
    include: { homeTeam: true, awayTeam: true },
  });

  return NextResponse.json({
    gamesNeedingUpdate: games.length,
    games: games.map((g) => ({
      id: g.id,
      matchup: `${g.awayTeam.shortName} @ ${g.homeTeam.shortName}`,
      status: g.status,
    })),
  });
}
