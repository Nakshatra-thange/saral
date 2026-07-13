import { useState } from "react";
import { roastMessage } from "./api";

export default function App() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = message.trim().length >= 10 && !loading;

  async function handleRoast() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await roastMessage(message, context);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-brand-700 to-brand-500 text-white">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">
            SIA's little sister
          </p>
          <h1 className="mt-1 text-4xl font-extrabold">The Ghost Meter 👻</h1>
          <p className="mt-2 max-w-xl text-brand-100">
            Paste your cold DM to an influencer. Find out if they'll reply — or
            ghost you into oblivion. Then get it rewritten the SARAL way.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <label className="block text-sm font-semibold text-slate-700">
          Your outreach message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi! I love your content so much! We'd love to collaborate…"
          rows={7}
          className="mt-2 w-full resize-y rounded-xl border border-slate-300 p-4 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Who's it going to?{" "}
          <span className="font-normal text-slate-400">(optional, sharpens the roast)</span>
        </label>
        <input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. fitness creator, 40k followers, posts daily gym vlogs"
          className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />

        <button
          onClick={handleRoast}
          disabled={!canSubmit}
          className="mt-6 w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Reading the room…" : "Roast my outreach 🔥"}
        </button>

        {!canSubmit && message.trim().length > 0 && message.trim().length < 10 && (
          <p className="mt-2 text-sm text-slate-400">
            A little more to work with — at least 10 characters.
          </p>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Ghost score</p>
              <p className="text-5xl font-extrabold text-brand-700">
                {result.ghostScore}
                <span className="text-2xl text-slate-400">/100</span>
              </p>
              <p className="mt-1 font-medium text-slate-700">{result.verdict}</p>
            </div>

            <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-10 text-center text-xs text-slate-400">
        Built as a love letter to SARAL's outreach engine.
      </footer>
    </div>
  );
}
