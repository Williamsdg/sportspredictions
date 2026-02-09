import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PicksPage() {
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-white text-center mb-4">Choose Your Sport</h1>
        <p className="text-zinc-400 text-center mb-12">Select a sport to make your picks</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Football */}
          <Link
            href="/picks/football"
            className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 hover:border-orange-500/50 transition-all hover:scale-[1.02] group"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🏈</div>
              <h2 className="text-2xl font-black text-white mb-2 group-hover:text-orange-500 transition-colors">
                College Football
              </h2>
              <p className="text-zinc-400 mb-4">Make your picks for this week&apos;s games</p>
              <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded-full">
                Season Active
              </span>
            </div>
          </Link>

          {/* Basketball */}
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 opacity-60">
            <div className="text-center">
              <div className="text-6xl mb-4">🏀</div>
              <h2 className="text-2xl font-black text-white mb-2">College Basketball</h2>
              <p className="text-zinc-400 mb-4">Coming November 2025</p>
              <span className="inline-block px-4 py-2 bg-zinc-700 text-zinc-400 text-xs font-bold uppercase rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
