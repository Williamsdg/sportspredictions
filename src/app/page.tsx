import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-white">
          Sports<span className="text-emerald-500">Predictions</span>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Predict. Compete.{" "}
            <span className="text-emerald-500">Win.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Make your picks for college football and basketball games.
            Track your record, compete against friends, and climb the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-zinc-700 hover:border-zinc-500 rounded-lg font-semibold text-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Make Your Picks</h3>
              <p className="text-zinc-400">
                Browse upcoming games and select your winners. Lock in picks before kickoff.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Record</h3>
              <p className="text-zinc-400">
                Watch your predictions play out. See your accuracy, streaks, and stats over time.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compete & Win</h3>
              <p className="text-zinc-400">
                Join leaderboards, create pick groups with friends, and prove you know your stuff.
              </p>
            </div>
          </div>
        </section>

        {/* Sports Section */}
        <section className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            Covered Sports
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
              <div className="text-5xl mb-4">🏈</div>
              <h3 className="text-2xl font-semibold mb-2">College Football</h3>
              <p className="text-zinc-400">
                FBS games every Saturday. Bowl season and playoffs included.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
              <div className="text-5xl mb-4">🏀</div>
              <h3 className="text-2xl font-semibold mb-2">College Basketball</h3>
              <p className="text-zinc-400">
                Regular season through March Madness. Every game counts.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make Your Picks?</h2>
          <p className="text-xl text-zinc-400 mb-8">
            Join now and start predicting today.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold text-lg transition-colors"
          >
            Create Free Account
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500">
          <p>&copy; 2025 Sports Predictions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
