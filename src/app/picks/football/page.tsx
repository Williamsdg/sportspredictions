"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  conference: string;
  primaryColor: string;
  wins: number;
  losses: number;
  ranking: number | null;
  lastFive: string | null;
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
  tvNetwork: string | null;
  spread: number | null;
}

interface Pick {
  id: string;
  gameId: string;
  pickedTeamId: string;
  isCorrect: boolean | null;
  createdAt: string;
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

type FilterTab = "upcoming" | "completed" | "all";

export default function FootballPicksPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Map<string, Pick>>(new Map());
  const [selectedConference, setSelectedConference] = useState("all");
  const [filterTab, setFilterTab] = useState<FilterTab>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [lastPick, setLastPick] = useState<{ gameId: string; teamId: string } | null>(null);
  const [, setCurrentTime] = useState(new Date());

  // Update time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchGames();
    fetchPicks();
  }, [selectedConference]);

  const fetchGames = async () => {
    try {
      const params = new URLSearchParams({ sport: "football" });
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
      const res = await fetch("/api/picks?sport=football");
      const data = await res.json();
      const pickMap = new Map<string, Pick>();
      data.picks?.forEach((pick: Pick) => {
        pickMap.set(pick.gameId, pick);
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
        const oldPick = picks.get(gameId);
        if (oldPick) {
          setLastPick({ gameId, teamId: oldPick.pickedTeamId });
        } else {
          setLastPick({ gameId, teamId });
        }
        const newPick: Pick = { id: "", gameId, pickedTeamId: teamId, isCorrect: null, createdAt: new Date().toISOString() };
        setPicks(new Map(picks.set(gameId, newPick)));
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

  const undoLastPick = async () => {
    if (!lastPick) return;

    try {
      const res = await fetch("/api/picks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: lastPick.gameId }),
      });

      if (res.ok) {
        const newPicks = new Map(picks);
        newPicks.delete(lastPick.gameId);
        setPicks(newPicks);
        setLastPick(null);
      }
    } catch (error) {
      console.error("Failed to undo pick:", error);
    }
  };

  // Compute weekly record
  const weeklyRecord = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    picks.forEach((pick) => {
      if (pick.isCorrect === true) correct++;
      if (pick.isCorrect === false) incorrect++;
    });
    return { correct, incorrect };
  }, [picks]);

  // Group games by date
  const groupGamesByDate = (games: Game[]) => {
    const groups: { [key: string]: Game[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    games.forEach((game) => {
      const gameDate = new Date(game.gameTime);
      gameDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((gameDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let label: string;
      if (diffDays < 0) {
        label = gameDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      } else if (diffDays === 0) {
        label = "Today";
      } else if (diffDays === 1) {
        label = "Tomorrow";
      } else if (diffDays < 7) {
        label = gameDate.toLocaleDateString("en-US", { weekday: "long" });
      } else {
        label = gameDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(game);
    });

    return groups;
  };

  // Filter games
  const filteredGames = useMemo(() => {
    let result = games;

    // Filter by tab
    if (filterTab === "upcoming") {
      result = result.filter((g) => g.status === "SCHEDULED" || g.status === "IN_PROGRESS");
    } else if (filterTab === "completed") {
      result = result.filter((g) => g.status === "FINAL");
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.homeTeam.name.toLowerCase().includes(query) ||
          g.homeTeam.shortName.toLowerCase().includes(query) ||
          g.awayTeam.name.toLowerCase().includes(query) ||
          g.awayTeam.shortName.toLowerCase().includes(query)
      );
    }

    return result;
  }, [games, filterTab, searchQuery]);

  const groupedGames = useMemo(() => groupGamesByDate(filteredGames), [filteredGames]);

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCountdown = (dateString: string) => {
    const now = new Date();
    const gameTime = new Date(dateString);
    const diff = gameTime.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  const isGameStarted = (dateString: string) => {
    return new Date() >= new Date(dateString);
  };

  const getWinner = (game: Game) => {
    if (game.homeScore === null || game.awayScore === null) return null;
    if (game.homeScore > game.awayScore) return game.homeTeam.id;
    if (game.awayScore > game.homeScore) return game.awayTeam.id;
    return null;
  };

  const formatSpread = (spread: number | null, isHome: boolean) => {
    if (spread === null) return null;
    const teamSpread = isHome ? -spread : spread;
    if (teamSpread === 0) return "EVEN";
    return teamSpread > 0 ? `+${teamSpread}` : `${teamSpread}`;
  };

  const renderLastFive = (lastFive: string | null) => {
    if (!lastFive) return null;
    return (
      <div className="flex gap-0.5 justify-center mt-1">
        {lastFive.split("").map((result, i) => (
          <span
            key={i}
            className={`w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded ${
              result === "W" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {result}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 px-4 sm:px-6 py-4 bg-zinc-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl font-black tracking-tight text-white">
            SPORT<span className="text-orange-500">PREDICTIONS</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white font-medium text-xs sm:text-sm uppercase tracking-wide transition-colors">
              Dashboard
            </Link>
            <Link href="/picks" className="text-orange-500 font-bold text-xs sm:text-sm uppercase tracking-wide">
              Picks
            </Link>
            <Link href="/leaderboard" className="text-zinc-400 hover:text-white font-medium text-xs sm:text-sm uppercase tracking-wide transition-colors">
              Leaderboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">🏈</span> Football Picks
            </h1>
            <p className="text-zinc-400 mt-1 text-sm sm:text-base">Select your winners</p>
          </div>

          {/* Weekly Record */}
          <div className="flex items-center gap-4 bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-800">
            <div className="text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">This Week</div>
              <div className="text-xl font-black">
                <span className="text-green-400">{weeklyRecord.correct}</span>
                <span className="text-zinc-600">-</span>
                <span className="text-red-400">{weeklyRecord.incorrect}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-700"></div>
            <div className="text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Picks</div>
              <div className="text-xl font-black text-orange-500">{picks.size}</div>
            </div>
            {lastPick && (
              <>
                <div className="h-8 w-px bg-zinc-700"></div>
                <button
                  onClick={undoLastPick}
                  className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>↩</span> Undo
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(["upcoming", "completed", "all"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors ${
                filterTab === tab
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conference Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {conferences.map((conf) => (
              <button
                key={conf}
                onClick={() => setSelectedConference(conf)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap transition-colors ${
                  selectedConference === conf
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                }`}
              >
                {conf === "all" ? "All" : conf}
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
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-zinc-400">No games found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedGames).map(([dateLabel, dateGames]) => (
              <div key={dateLabel}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-lg font-bold text-white">{dateLabel}</h2>
                  <div className="flex-1 h-px bg-zinc-800"></div>
                  <span className="text-sm text-zinc-500">{dateGames.length} games</span>
                </div>

                <div className="space-y-3">
                  {dateGames.map((game) => {
                    const userPick = picks.get(game.id);
                    const gameStarted = isGameStarted(game.gameTime);
                    const isCompleted = game.status === "FINAL";
                    const isLive = game.status === "IN_PROGRESS";
                    const winner = getWinner(game);
                    const userWon = isCompleted && userPick?.pickedTeamId === winner;
                    const userLost = isCompleted && userPick && userPick.pickedTeamId !== winner;
                    const countdown = getCountdown(game.gameTime);

                    return (
                      <div
                        key={game.id}
                        className={`bg-zinc-900 rounded-xl border overflow-hidden ${
                          userWon ? "border-green-500/50" : userLost ? "border-red-500/50" : "border-zinc-800"
                        }`}
                      >
                        {/* Game Header */}
                        <div className="px-4 sm:px-6 py-2 sm:py-3 bg-zinc-800/50 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-zinc-400">
                              {formatGameTime(game.gameTime)}
                            </div>
                            {game.tvNetwork && (
                              <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs font-medium rounded">
                                {game.tvNetwork}
                              </span>
                            )}
                            {countdown && !isLive && !isCompleted && (
                              <span className="text-xs text-orange-400 font-mono">
                                ⏱ {countdown}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isLive && (
                              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase rounded-full animate-pulse">
                                Live
                              </span>
                            )}
                            {isCompleted ? (
                              <span className="px-3 py-1 bg-zinc-600 text-white text-xs font-bold uppercase rounded-full">
                                Final
                              </span>
                            ) : gameStarted && !isLive ? (
                              <span className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-bold uppercase rounded-full">
                                Locked
                              </span>
                            ) : userPick ? (
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded-full">
                                ✓ Picked
                              </span>
                            ) : null}
                            {userWon && (
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded-full">
                                +1
                              </span>
                            )}
                            {userLost && (
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase rounded-full">
                                ✗
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Teams */}
                        <div className="p-4 sm:p-6">
                          <div className="flex items-stretch gap-3 sm:gap-4">
                            {/* Away Team */}
                            <button
                              onClick={() => !gameStarted && !isCompleted && submitPick(game.id, game.awayTeam.id)}
                              disabled={gameStarted || isCompleted || submitting === game.id}
                              className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[140px] sm:min-h-[160px] ${
                                userPick?.pickedTeamId === game.awayTeam.id
                                  ? isCompleted
                                    ? winner === game.awayTeam.id
                                      ? "border-green-500 bg-green-500/10"
                                      : "border-red-500 bg-red-500/10"
                                    : "border-orange-500 bg-orange-500/10"
                                  : "border-zinc-700 hover:border-zinc-500"
                              } ${gameStarted || isCompleted ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"} ${
                                isCompleted && winner === game.awayTeam.id ? "opacity-100" : isCompleted ? "opacity-60" : ""
                              }`}
                            >
                              <div className="text-center h-full flex flex-col justify-center">
                                {game.awayTeam.ranking && (
                                  <div className="text-orange-500 text-xs font-bold mb-1">#{game.awayTeam.ranking}</div>
                                )}
                                <div
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-black text-xs sm:text-sm"
                                  style={{ backgroundColor: game.awayTeam.primaryColor }}
                                >
                                  {game.awayTeam.abbreviation}
                                </div>
                                <div className="font-bold text-white text-sm sm:text-base">{game.awayTeam.shortName}</div>
                                <div className="text-xs text-zinc-500">
                                  {game.awayTeam.wins}-{game.awayTeam.losses}
                                </div>
                                {renderLastFive(game.awayTeam.lastFive)}
                                {game.spread !== null && (
                                  <div className="text-xs text-zinc-400 mt-1 font-mono">
                                    {formatSpread(game.spread, false)}
                                  </div>
                                )}
                                {isCompleted && (
                                  <div className={`text-2xl font-black mt-2 ${winner === game.awayTeam.id ? "text-green-400" : "text-zinc-500"}`}>
                                    {game.awayScore}
                                  </div>
                                )}
                                {isLive && game.awayScore !== null && (
                                  <div className="text-xl font-black mt-2 text-white">
                                    {game.awayScore}
                                  </div>
                                )}
                                {userPick?.pickedTeamId === game.awayTeam.id && (
                                  <div className={`mt-2 text-xs font-bold uppercase ${
                                    isCompleted
                                      ? winner === game.awayTeam.id ? "text-green-400" : "text-red-400"
                                      : "text-orange-500"
                                  }`}>
                                    Your Pick
                                  </div>
                                )}
                              </div>
                            </button>

                            {/* VS */}
                            <div className="flex items-center text-zinc-600 font-bold text-lg">@</div>

                            {/* Home Team */}
                            <button
                              onClick={() => !gameStarted && !isCompleted && submitPick(game.id, game.homeTeam.id)}
                              disabled={gameStarted || isCompleted || submitting === game.id}
                              className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[140px] sm:min-h-[160px] ${
                                userPick?.pickedTeamId === game.homeTeam.id
                                  ? isCompleted
                                    ? winner === game.homeTeam.id
                                      ? "border-green-500 bg-green-500/10"
                                      : "border-red-500 bg-red-500/10"
                                    : "border-orange-500 bg-orange-500/10"
                                  : "border-zinc-700 hover:border-zinc-500"
                              } ${gameStarted || isCompleted ? "cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"} ${
                                isCompleted && winner === game.homeTeam.id ? "opacity-100" : isCompleted ? "opacity-60" : ""
                              }`}
                            >
                              <div className="text-center h-full flex flex-col justify-center">
                                {game.homeTeam.ranking && (
                                  <div className="text-orange-500 text-xs font-bold mb-1">#{game.homeTeam.ranking}</div>
                                )}
                                <div
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-black text-xs sm:text-sm"
                                  style={{ backgroundColor: game.homeTeam.primaryColor }}
                                >
                                  {game.homeTeam.abbreviation}
                                </div>
                                <div className="font-bold text-white text-sm sm:text-base">{game.homeTeam.shortName}</div>
                                <div className="text-xs text-zinc-500">
                                  {game.homeTeam.wins}-{game.homeTeam.losses}
                                </div>
                                {renderLastFive(game.homeTeam.lastFive)}
                                {game.spread !== null && (
                                  <div className="text-xs text-zinc-400 mt-1 font-mono">
                                    {formatSpread(game.spread, true)}
                                  </div>
                                )}
                                {isCompleted && (
                                  <div className={`text-2xl font-black mt-2 ${winner === game.homeTeam.id ? "text-green-400" : "text-zinc-500"}`}>
                                    {game.homeScore}
                                  </div>
                                )}
                                {isLive && game.homeScore !== null && (
                                  <div className="text-xl font-black mt-2 text-white">
                                    {game.homeScore}
                                  </div>
                                )}
                                {userPick?.pickedTeamId === game.homeTeam.id && (
                                  <div className={`mt-2 text-xs font-bold uppercase ${
                                    isCompleted
                                      ? winner === game.homeTeam.id ? "text-green-400" : "text-red-400"
                                      : "text-orange-500"
                                  }`}>
                                    Your Pick
                                  </div>
                                )}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
