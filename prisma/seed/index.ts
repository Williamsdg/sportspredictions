import { PrismaClient } from "@prisma/client";
import { conferences } from "./teams";
import { basketballConferences, sampleBasketballGames } from "./basketball-teams";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create Football sport
  const football = await prisma.sport.upsert({
    where: { slug: "football" },
    update: {},
    create: {
      name: "Football",
      slug: "football",
    },
  });
  console.log("Created sport:", football.name);

  // Create Basketball sport
  const basketball = await prisma.sport.upsert({
    where: { slug: "basketball" },
    update: {},
    create: {
      name: "Basketball",
      slug: "basketball",
    },
  });
  console.log("Created sport:", basketball.name);

  // Create 2024-25 Football season
  const footballSeason = await prisma.season.upsert({
    where: {
      sportId_year: {
        sportId: football.id,
        year: 2024,
      },
    },
    update: { isActive: true },
    create: {
      sportId: football.id,
      name: "2024-25",
      year: 2024,
      startDate: new Date("2024-08-24"),
      endDate: new Date("2025-01-20"),
      isActive: true,
    },
  });
  console.log("Created season:", footballSeason.name);

  // Create all teams by conference
  let teamCount = 0;
  for (const [conference, teams] of Object.entries(conferences)) {
    for (const team of teams) {
      await prisma.team.upsert({
        where: {
          abbreviation_sportId: {
            abbreviation: team.abbreviation,
            sportId: football.id,
          },
        },
        update: {
          name: team.name,
          shortName: team.shortName,
          conference,
          primaryColor: team.primaryColor,
        },
        create: {
          name: team.name,
          shortName: team.shortName,
          abbreviation: team.abbreviation,
          sportId: football.id,
          conference,
          primaryColor: team.primaryColor,
        },
      });
      teamCount++;
    }
    console.log(`Created ${teams.length} teams for ${conference}`);
  }
  console.log(`Total teams created: ${teamCount}`);

  // Create some sample games for Week 1
  const teams = await prisma.team.findMany({
    where: { sportId: football.id },
  });

  const teamMap = new Map(teams.map((t) => [t.abbreviation, t]));

  // Sample Week 1 games (these are fictional matchups for testing)
  const week1Games = [
    { home: "UGA", away: "CLEM", time: "2025-08-30T15:30:00Z" },
    { home: "OSU", away: "TEX", time: "2025-08-30T19:00:00Z" },
    { home: "MICH", away: "ND", time: "2025-08-30T19:30:00Z" },
    { home: "ALA", away: "FSU", time: "2025-08-30T20:00:00Z" },
    { home: "LSU", away: "USC", time: "2025-08-30T20:30:00Z" },
    { home: "ORE", away: "TENN", time: "2025-08-31T16:00:00Z" },
    { home: "PSU", away: "WIS", time: "2025-08-31T12:00:00Z" },
    { home: "MIA", away: "FLA", time: "2025-08-31T15:30:00Z" },
  ];

  for (const game of week1Games) {
    const homeTeam = teamMap.get(game.home);
    const awayTeam = teamMap.get(game.away);

    if (homeTeam && awayTeam) {
      await prisma.game.upsert({
        where: {
          id: `week1-${game.home}-${game.away}`,
        },
        update: {},
        create: {
          id: `week1-${game.home}-${game.away}`,
          sportId: football.id,
          seasonId: footballSeason.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          gameTime: new Date(game.time),
          week: 1,
          venue: `${homeTeam.shortName} Stadium`,
        },
      });
      console.log(`Created game: ${awayTeam.shortName} @ ${homeTeam.shortName}`);
    }
  }

  // ========== BASKETBALL ==========
  console.log("\n--- Seeding Basketball ---");

  // Create 2025-26 Basketball season
  const basketballSeason = await prisma.season.upsert({
    where: {
      sportId_year: {
        sportId: basketball.id,
        year: 2025,
      },
    },
    update: { isActive: true },
    create: {
      sportId: basketball.id,
      name: "2025-26",
      year: 2025,
      startDate: new Date("2025-11-01"),
      endDate: new Date("2026-04-07"),
      isActive: true,
    },
  });
  console.log("Created basketball season:", basketballSeason.name);

  // Create basketball teams
  let bballTeamCount = 0;
  for (const [conference, teams] of Object.entries(basketballConferences)) {
    for (const team of teams) {
      await prisma.team.upsert({
        where: {
          abbreviation_sportId: {
            abbreviation: team.abbreviation,
            sportId: basketball.id,
          },
        },
        update: {
          name: team.name,
          shortName: team.shortName,
          conference,
          primaryColor: team.primaryColor,
        },
        create: {
          name: team.name,
          shortName: team.shortName,
          abbreviation: team.abbreviation,
          sportId: basketball.id,
          conference,
          primaryColor: team.primaryColor,
        },
      });
      bballTeamCount++;
    }
    console.log(`Created ${teams.length} basketball teams for ${conference}`);
  }
  console.log(`Total basketball teams created: ${bballTeamCount}`);

  // Create basketball games
  const bballTeams = await prisma.team.findMany({
    where: { sportId: basketball.id },
  });

  const bballTeamMap = new Map(bballTeams.map((t) => [t.abbreviation, t]));

  for (const game of sampleBasketballGames) {
    const homeTeam = bballTeamMap.get(game.home);
    const awayTeam = bballTeamMap.get(game.away);

    if (homeTeam && awayTeam) {
      const gameId = `bball-${game.home}-${game.away}-${game.time}`;
      await prisma.game.upsert({
        where: { id: gameId },
        update: {
          homeScore: game.homeScore ?? null,
          awayScore: game.awayScore ?? null,
          status: game.homeScore ? "FINAL" : "SCHEDULED",
        },
        create: {
          id: gameId,
          sportId: basketball.id,
          seasonId: basketballSeason.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          gameTime: new Date(game.time),
          week: 1,
          venue: `${homeTeam.shortName} Arena`,
          homeScore: game.homeScore ?? null,
          awayScore: game.awayScore ?? null,
          status: game.homeScore ? "FINAL" : "SCHEDULED",
        },
      });
      const scoreInfo = game.homeScore ? ` (${game.awayScore}-${game.homeScore})` : "";
      console.log(`Created basketball game: ${awayTeam.shortName} @ ${homeTeam.shortName}${scoreInfo}`);
    }
  }

  console.log("\nSeed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
