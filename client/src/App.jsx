import { useState } from "react";
import { roastMessage } from "./api";
import { EXAMPLES } from "./examples";
function GhostGauge({ score }) {
  const r = 50, circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 70 ? "#e8564f" : score >= 40 ? "#eab308" : "#22c55e";
  const label = score >= 70 ? "GHOSTED" : score >= 40 ? "RISKY" : "REPLY-WORTHY";
  return (
    <div className="relative h-[104px] w-[104px] flex-shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="11" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="11"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center ink">
        <span className="text-3xl font-extrabold leading-none">{score}</span>
        <span className="text-[10px] font-semibold tracking-wide opacity-75">{label}</span>
      </div>
    </div>
  );
}

function Roast({ quote, problem }) {
  return (
    <div className="glass rounded-2xl px-4 py-3.5">
      <p className="m-0 text-[13px] italic text-slate-600">"{quote}"</p>
      <p className="mt-1 text-[13px] font-medium text-slate-800">{problem}</p>
    </div>
  );
}

function Skeleton() {
    return (
      <>
        <div className="glass flex items-center gap-4 rounded-3xl p-5">
          <div className="h-[104px] w-[104px] flex-shrink-0 animate-pulse rounded-full bg-white/40" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-white/40" />
            <div className="h-5 w-40 animate-pulse rounded bg-white/50" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-white/40" />
          </div>
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="glass space-y-2 rounded-2xl px-4 py-3.5">
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/40" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-white/50" />
          </div>
        ))}
      </>
    );
  }

export default function App() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const canSubmit = message.trim().length >= 10 && !loading;

  async function handleRoast() {
    setLoading(true); setError(""); setResult(null); setCopied(false);
    try { setResult(await roastMessage(message, context)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function copyRewrite() {
    navigator.clipboard.writeText(result.rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div className="scene">
        <div className="sun" />
        <div className="cloud" style={{ top: "20%", width: 260, animationDuration: "42s" }} />
        <div className="cloud" style={{ top: "52%", width: 220, animationDuration: "55s", animationDelay: "-20s" }} />
        <div className="cloud" style={{ top: "78%", width: 300, animationDuration: "48s", animationDelay: "-8s" }} />
      </div>

      <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-5 py-10">
        <header className="ink">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.15em] text-indigo-900/70">
            SIA's little sister
          </p>
          <h1 className="mt-1 text-4xl font-extrabold">The Ghost Meter 👻</h1>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Paste your cold DM. See if they'll reply — or ghost you into oblivion.
          </p>
        </header>

        {/* Input card */}
        <div className="glass rounded-3xl p-5">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I love your content so much! We'd love to collaborate…"
            rows={5}
            className="w-full resize-y rounded-2xl border border-white/50 bg-white/40 p-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:bg-white/60"
          />
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Who's it going to? e.g. fitness creator, 40k followers"
            className="mt-3 w-full rounded-2xl border border-white/50 bg-white/40 p-3 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:bg-white/60"
          />
          <button
            onClick={handleRoast}
            disabled={!canSubmit}
            className="glass-strong mt-4 w-full rounded-2xl px-6 py-3.5 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Reading the room…" : "Roast my outreach 🔥"}
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="self-center text-xs font-medium text-slate-600">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setMessage(ex.text)}
                className="rounded-full border border-white/50 bg-white/30 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-white/50"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <Skeleton />}

        {error && (
          <div className="glass rounded-2xl px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        {result && (
          <>
            {/* Score card */}
            <div className="glass flex items-center gap-4 rounded-3xl p-5">
              <GhostGauge score={result.ghostScore} />
              <div className="ink">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.15em] text-indigo-900/70">
                  Ghost meter
                </p>
                <p className="mt-1 text-xl font-extrabold">{result.verdict}</p>
                <span className="mt-2 inline-block rounded-full border border-rose-400/40 bg-rose-400/25 px-3 py-1 text-xs font-semibold text-rose-900">
                  vibe: {result.vibe}
                </span>
                {result.demoMode && (
                  <p className="mt-2 text-[11px] font-medium text-indigo-900/60">
                    demo mode — add an API key for the real SIA
                  </p>
                )}
              </div>
            </div>

            {/* Roasts */}
            {result.roasts.map((r, i) => (
              <Roast key={i} quote={r.quote} problem={r.problem} />
            ))}

            {/* Rewrite */}
            <div className="glass-strong glass rounded-3xl p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-indigo-50">
                  The SARAL rewrite
                </p>
                <button
                  onClick={copyRewrite}
                  className="rounded-lg bg-white/25 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/40"
                >
                  {copied ? "copied ✓" : "copy"}
                </button>
              </div>
              <p className="m-0 whitespace-pre-wrap text-[13px] leading-relaxed text-indigo-50">
                {result.rewrite}
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}