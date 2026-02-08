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
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Sports<span className="text-emerald-500">Predictions</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-white font-medium">
              Dashboard
            </Link>
            <Link href="/picks" className="text-zinc-400 hover:text-white transition-colors">
              My Picks
            </Link>
            <Link href="/leaderboard" className="text-zinc-400 hover:text-white transition-colors">
              Leaderboard
            </Link>
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-zinc-700">
              <span className="text-zinc-400">{session.user?.name || session.user?.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Total Picks</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Correct</p>
            <p className="text-3xl font-bold text-emerald-500">0</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Win Rate</p>
            <p className="text-3xl font-bold">--%</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Current Streak</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🏈</span> College Football
            </h2>
            <p className="text-zinc-400 mb-4">Make your picks for this week&apos;s games</p>
            <Link
              href="/picks/football"
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
            >
              Make Picks
            </Link>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🏀</span> College Basketball
            </h2>
            <p className="text-zinc-400 mb-4">Make your picks for upcoming games</p>
            <Link
              href="/picks/basketball"
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
            >
              Make Picks
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Recent Picks</h2>
          <div className="text-zinc-400 text-center py-8">
            <p>No picks yet. Start by making your first prediction!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
