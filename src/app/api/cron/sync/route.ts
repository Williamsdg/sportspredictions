import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBasketballScoreboard, parseGameState, mapTeamName } from "@/lib/ncaa-api";

export const dynamic = "force-dynamic";

// Vercel cron job endpoint
// Runs every 4 hours to sync scores
export async function GET(request: Request) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = {
      basketball: { synced: 0, skipped: 0 },
    };

    // Sync basketball for today and yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

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

    // Sync yesterday and today
    for (const date of [yesterday, today]) {
      const data = await getBasketballScoreboard(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );

      if (!data?.games) continue;

      for (const { game } of data.games) {
        const homeAbbr = mapTeamName(game.home.names.seo);
        const awayAbbr = mapTeamName(game.away.names.seo);

        const homeTeam = teamMap.get(homeAbbr);
        const awayTeam = teamMap.get(awayAbbr);

        if (!homeTeam || !awayTeam) {
          results.basketball.skipped++;
          continue;
        }

        const { status, homeScore, awayScore } = parseGameState(game);
        const gameTime = new Date(game.startTimeEpoch * 1000);

        await prisma.game.upsert({
          where: { externalId: game.gameID },
          update: { homeScore, awayScore, status },
          create: {
            externalId: game.gameID,
            sportId: sport.id,
            seasonId: season.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            gameTime,
            week: 1,
            homeScore,
            awayScore,
            status,
          },
        });
        results.basketball.synced++;
      }
    }

    // Update isCorrect for picks on completed games
    const completedGames = await prisma.game.findMany({
      where: {
        status: "FINAL",
        homeScore: { not: null },
        awayScore: { not: null },
      },
      include: { picks: true },
    });

    let picksUpdated = 0;
    for (const game of completedGames) {
      const winnerId = game.homeScore! > game.awayScore! ? game.homeTeamId : game.awayTeamId;

      for (const pick of game.picks) {
        if (pick.isCorrect === null) {
          await prisma.pick.update({
            where: { id: pick.id },
            data: { isCorrect: pick.pickedTeamId === winnerId },
          });
          picksUpdated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      picksUpdated,
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
