import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 px-6 py-4 bg-zinc-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            SPORT<span className="text-orange-500">PREDICTIONS</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-orange-500 font-bold text-sm uppercase tracking-wide">
              Dashboard
            </Link>
            <Link href="/picks" className="text-zinc-400 hover:text-white font-medium text-sm uppercase tracking-wide transition-colors">
              My Picks
            </Link>
            <Link href="/leaderboard" className="text-zinc-400 hover:text-white font-medium text-sm uppercase tracking-wide transition-colors">
              Leaderboard
            </Link>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-zinc-700">
              <span className="text-zinc-400 text-sm">{session.user?.name || session.user?.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            Welcome back, <span className="text-orange-500">{session.user?.name || 'Picker'}</span>
          </h1>
          <p className="text-zinc-400">Ready to make some picks?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Total Picks</p>
            <p className="text-4xl font-black text-white scoreboard">0</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Correct</p>
            <p className="text-4xl font-black text-green-500 scoreboard">0</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Win Rate</p>
            <p className="text-4xl font-black text-orange-500 scoreboard">--%</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Current Streak</p>
            <p className="text-4xl font-black text-blue-500 scoreboard">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-orange-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🏈</span> College Football
              </h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded-full">
                Live
              </span>
            </div>
            <p className="text-zinc-400 mb-6">Make your picks for this week&apos;s games</p>
            <Link
              href="/picks/football"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors"
            >
              Make Picks
            </Link>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🏀</span> College Basketball
              </h2>
              <span className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs font-bold uppercase rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-zinc-400 mb-6">Basketball picks available November 2025</p>
            <button
              disabled
              className="inline-block px-6 py-3 bg-zinc-700 text-zinc-500 rounded-lg font-bold text-sm uppercase tracking-wide cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-4">Recent Picks</h2>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-zinc-400 mb-4">No picks yet. Time to make your first prediction!</p>
            <Link
              href="/picks/football"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors"
            >
              Make Your First Pick
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
