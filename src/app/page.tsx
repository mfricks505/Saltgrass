export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Welcome to <span className="text-emerald-500">Saltgrass</span>
        </h1>
        <p className="text-2xl text-zinc-400 mb-12">
          Florida’s premier app for hunters, fishermen, and boaters
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href="/analyzer"
            className="px-10 py-6 bg-emerald-600 hover:bg-emerald-700 rounded-3xl text-2xl font-semibold"
          >
            Go/No-Go Analyzer
          </a>
          <a
            href="/auth/login"
            className="px-10 py-6 bg-zinc-800 hover:bg-zinc-700 rounded-3xl text-2xl font-semibold"
          >
            Login / Sign Up
          </a>
        </div>

        <p className="mt-16 text-zinc-500">
          Deep green. Salt life. Real conditions. Real community.
        </p>
      </div>
    </div>
  );
}