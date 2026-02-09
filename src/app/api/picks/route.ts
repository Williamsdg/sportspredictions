import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Get user's picks
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");
    const sport = searchParams.get("sport") || "football";

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

    const where: Record<string, unknown> = {
      userId: session.user.id,
      game: {
        sportId: sportRecord.id,
        seasonId: activeSeason.id,
      },
    };

    if (week) {
      where.game = {
        ...where.game as object,
        week: parseInt(week),
      };
    }

    const picks = await prisma.pick.findMany({
      where,
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        pickedTeam: true,
      },
    });

    return NextResponse.json({ picks });
  } catch (error) {
    console.error("Picks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch picks" },
      { status: 500 }
    );
  }
}

// Submit a pick
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId, pickedTeamId } = await request.json();

    if (!gameId || !pickedTeamId) {
      return NextResponse.json(
        { error: "Game ID and picked team ID are required" },
        { status: 400 }
      );
    }

    // Check if game exists and hasn't started
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { homeTeam: true, awayTeam: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (new Date() >= game.gameTime) {
      return NextResponse.json(
        { error: "Cannot pick after game has started" },
        { status: 400 }
      );
    }

    // Verify picked team is one of the teams in the game
    if (pickedTeamId !== game.homeTeamId && pickedTeamId !== game.awayTeamId) {
      return NextResponse.json(
        { error: "Invalid team selection" },
        { status: 400 }
      );
    }

    // Upsert pick (create or update)
    const pick = await prisma.pick.upsert({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
      update: {
        pickedTeamId,
      },
      create: {
        userId: session.user.id,
        gameId,
        pickedTeamId,
      },
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        pickedTeam: true,
      },
    });

    return NextResponse.json({ pick });
  } catch (error) {
    console.error("Pick submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit pick" },
      { status: 500 }
    );
  }
}

// Delete a pick (undo)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    // Check if game hasn't started
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (new Date() >= game.gameTime) {
      return NextResponse.json(
        { error: "Cannot undo after game has started" },
        { status: 400 }
      );
    }

    // Delete the pick
    await prisma.pick.delete({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pick deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete pick" },
      { status: 500 }
    );
  }
}
