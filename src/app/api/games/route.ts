import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") || "football";
    const week = searchParams.get("week");
    const conference = searchParams.get("conference");

    const sportRecord = await prisma.sport.findUnique({
      where: { slug: sport },
    });

    if (!sportRecord) {
      return NextResponse.json({ error: "Sport not found" }, { status: 404 });
    }

    const activeSeason = await prisma.season.findFirst({
      where: { sportId: sportRecord.id, isActive: true },
    });

    if (!activeSeason) {
      return NextResponse.json({ error: "No active season" }, { status: 404 });
    }

    // Build query
    const where: Record<string, unknown> = {
      sportId: sportRecord.id,
      seasonId: activeSeason.id,
    };

    if (week) {
      where.week = parseInt(week);
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { gameTime: "asc" },
    });

    // Filter by conference if specified
    let filteredGames = games;
    if (conference && conference !== "all") {
      filteredGames = games.filter(
        (game) =>
          game.homeTeam.conference === conference ||
          game.awayTeam.conference === conference
      );
    }

    return NextResponse.json({
      games: filteredGames,
      season: activeSeason,
    });
  } catch (error) {
    console.error("Games fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
