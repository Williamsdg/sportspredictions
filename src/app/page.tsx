import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto relative z-10">
        <Link href="/" className="text-2xl font-black tracking-tight text-white">
          SPORT<span className="text-orange-500">PREDICTIONS</span>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-zinc-300 hover:text-white font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-gradient stadium-lights">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10">
          <div className="text-center">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/80 rounded-full mb-8 border border-zinc-700">
              <span className="w-2 h-2 bg-green-500 rounded-full pulse-live"></span>
              <span className="text-sm font-medium text-zinc-300">2025 Season Now Live</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none">
              <span className="text-white">MAKE YOUR</span>
              <br />
              <span className="text-orange-500 glow-orange">PICKS</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 font-medium">
              Predict college football & basketball winners.
              <br className="hidden sm:block" />
              <span className="text-white">Compete. Track. Dominate.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/register"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-lg uppercase tracking-wide transition-all hover:scale-105"
              >
                Start Picking Free
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-bold text-lg transition-colors"
              >
                How It Works
              </Link>
            </div>

            {/* Stats preview */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-4 border border-zinc-800">
                <div className="text-3xl font-black text-orange-500 scoreboard">1.2K+</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Active Pickers</div>
              </div>
              <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-4 border border-zinc-800">
                <div className="text-3xl font-black text-blue-500 scoreboard">50K+</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Picks Made</div>
              </div>
              <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-4 border border-zinc-800">
                <div className="text-3xl font-black text-green-500 scoreboard">68%</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Avg Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
      </main>

      {/* Sports Cards */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-3">Covered Sports</h2>
            <p className="text-3xl md:text-4xl font-black text-white">Choose Your Game</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Football Card */}
            <div className="sport-card animated-border rounded-2xl p-8 bg-zinc-900">
              <div className="flex items-start justify-between mb-6">
                <div className="text-6xl">🏈</div>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold uppercase rounded-full">
                  In Season
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">College Football</h3>
              <p className="text-zinc-400 mb-6">
                Every FBS game, every Saturday. From Week 0 through the National Championship.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-zinc-500">Bowl Season</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-zinc-500">134 Teams</span>
                </div>
              </div>
            </div>

            {/* Basketball Card */}
            <div className="sport-card animated-border rounded-2xl p-8 bg-zinc-900">
              <div className="flex items-start justify-between mb-6">
                <div className="text-6xl">🏀</div>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold uppercase rounded-full">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">College Basketball</h3>
              <p className="text-zinc-400 mb-6">
                Full season coverage. Conference play through March Madness brackets.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-zinc-500">March Madness</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-zinc-500">363 Teams</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-3">How It Works</h2>
            <p className="text-3xl md:text-4xl font-black text-white">Three Steps to Glory</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pick Your Winners</h3>
              <p className="text-zinc-400">
                Browse this week&apos;s games. Select who you think will win. Lock in before kickoff.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Watch & Track</h3>
              <p className="text-zinc-400">
                Follow your picks in real-time. See results update as games finish.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Climb the Board</h3>
              <p className="text-zinc-400">
                Earn points for correct picks. Rise up the leaderboard. Prove you&apos;re the best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Prove Your
            <span className="text-orange-500"> Picks?</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Join thousands of fans making their predictions every week.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-5 bg-orange-500 hover:bg-orange-600 rounded-xl font-black text-xl uppercase tracking-wide transition-all hover:scale-105"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-black tracking-tight text-white">
              SPORT<span className="text-orange-500">PREDICTIONS</span>
            </div>
            <p className="text-zinc-500 text-sm">
              &copy; 2025 Sport Predictions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
