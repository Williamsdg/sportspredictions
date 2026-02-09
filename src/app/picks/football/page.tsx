"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  conference: string;
  primaryColor: string;
}

interface Game {
  id: string;
  gameTime: string;
  week: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

interface Pick {
  id: string;
  gameId: string;
  pickedTeamId: string;
}

const conferences = [
  "all",
  "SEC",
  "Big Ten",
  "Big 12",
  "ACC",
  "American",
  "Mountain West",
  "Sun Belt",
  "MAC",
  "C-USA",
  "Independents",
];

export default function FootballPicksPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Map<string, string>>(new Map());
  const [selectedConference, setSelectedConference] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
    fetchPicks();
  }, [selectedConference]);

  const fetchGames = async () => {
    try {
      const params = new URLSearchParams({
        sport: "football",
        week: "1",
      });
      if (selectedConference !== "all") {
        params.set("conference", selectedConference);
      }
      const res = await fetch(`/api/games?${params}`);
      const data = await res.json();
      setGames(data.games || []);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPicks = async () => {
    try {
      const res = await fetch("/api/picks?sport=football&week=1");
      const data = await res.json();
      const pickMap = new Map<string, string>();
      data.picks?.forEach((pick: Pick) => {
        pickMap.set(pick.gameId, pick.pickedTeamId);
      });
      setPicks(pickMap);
    } catch (error) {
      console.error("Failed to fetch picks:", error);
    }
  };

  const submitPick = async (gameId: string, teamId: string) => {
    setSubmitting(gameId);
    try {
      const res = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, pickedTeamId: teamId }),
      });

      if (res.ok) {
        setPicks(new Map(picks.set(gameId, teamId)));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit pick");
      }
    } catch (error) {
      console.error("Failed to submit pick:", error);
      alert("Failed to submit pick");
    } finally {
      setSubmitting(null);
    }
  };

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isGameStarted = (dateString: string) => {
    return new Date() >= new Date(dateString);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 px-6 py-4 bg-zinc-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            SPORT<span className="text-orange-500">PREDICTIONS</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white font-medium text-sm uppercase tracking-wide transition-colors">
              Dashboard
            </Link>
            <Link href="/picks" className="text-orange-500 font-bold text-sm uppercase tracking-wide">
              My Picks
            </Link>
            <Link href="/leaderboard" className="text-zinc-400 hover:text-white font-medium text-sm uppercase tracking-wide transition-colors">
              Leaderboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <span className="text-4xl">🏈</span> College Football Picks
            </h1>
            <p className="text-zinc-400 mt-1">Week 1 - Select your winners</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500 uppercase tracking-wide">Your Picks</div>
            <div className="text-2xl font-black text-orange-500">{picks.size} / {games.length}</div>
          </div>
        </div>

        {/* Conference Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {conferences.map((conf) => (
              <button
                key={conf}
                onClick={() => setSelectedConference(conf)}
                className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide whitespace-nowrap transition-colors ${
                  selectedConference === conf
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {conf === "all" ? "All Games" : conf}
              </button>
            ))}
          </div>
        </div>

        {/* Games List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-bounce">🏈</div>
            <p className="text-zinc-400">Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-zinc-400">No games found for this selection</p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => {
              const userPick = picks.get(game.id);
              const gameStarted = isGameStarted(game.gameTime);

              return (
                <div
                  key={game.id}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden"
                >
                  {/* Game Header */}
                  <div className="px-6 py-3 bg-zinc-800/50 flex items-center justify-between">
                    <div className="text-sm text-zinc-400">
                      {formatGameTime(game.gameTime)}
                    </div>
                    <div className="flex items-center gap-2">
                      {gameStarted ? (
                        <span className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-bold uppercase rounded-full">
                          Locked
                        </span>
                      ) : userPick ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded-full">
                          Picked
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold uppercase rounded-full">
                          Make Pick
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      {/* Away Team */}
                      <button
                        onClick={() => !gameStarted && submitPick(game.id, game.awayTeam.id)}
                        disabled={gameStarted || submitting === game.id}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          userPick === game.awayTeam.id
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-zinc-700 hover:border-zinc-500"
                        } ${gameStarted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="text-center">
                          <div
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black text-sm"
                            style={{ backgroundColor: game.awayTeam.primaryColor }}
                          >
                            {game.awayTeam.abbreviation}
                          </div>
                          <div className="font-bold text-white">{game.awayTeam.shortName}</div>
                          <div className="text-xs text-zinc-500 mt-1">{game.awayTeam.conference}</div>
                          {userPick === game.awayTeam.id && (
                            <div className="mt-2 text-orange-500 text-xs font-bold uppercase">Your Pick</div>
                          )}
                        </div>
                      </button>

                      {/* VS */}
                      <div className="text-zinc-600 font-bold text-lg">@</div>

                      {/* Home Team */}
                      <button
                        onClick={() => !gameStarted && submitPick(game.id, game.homeTeam.id)}
                        disabled={gameStarted || submitting === game.id}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          userPick === game.homeTeam.id
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-zinc-700 hover:border-zinc-500"
                        } ${gameStarted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="text-center">
                          <div
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black text-sm"
                            style={{ backgroundColor: game.homeTeam.primaryColor }}
                          >
                            {game.homeTeam.abbreviation}
                          </div>
                          <div className="font-bold text-white">{game.homeTeam.shortName}</div>
                          <div className="text-xs text-zinc-500 mt-1">{game.homeTeam.conference}</div>
                          {userPick === game.homeTeam.id && (
                            <div className="mt-2 text-orange-500 text-xs font-bold uppercase">Your Pick</div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
