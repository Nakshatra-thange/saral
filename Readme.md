# The Ghost Meter

> SIA's little sister. Paste a cold DM to an influencer — find out if they'll
> reply or ghost you, then get it rewritten the SARAL way.

Built as a working love letter to [SARAL](https://getsaral.com)'s outreach
engine. Instead of sending a résumé, I sent a feature.

## What it does

1. You paste your outreach message (optionally, who it's going to).
2. It scores how likely you are to get **ghosted** (0–100).
3. It roasts the weak lines — specifically, not vaguely.
4. It rewrites the message: personalized, value-first, never desperate.

## Why it exists

SARAL's whole thesis is *stop gambling with influencers*. Bad outreach is the
first place that gamble goes wrong — generic, all-about-the-brand, desperate.
This tool catches that before send, in the voice of the platform's own AI.

## Run it

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # optional — see below
npm run dev

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # opens http://localhost:5173
```

**No API key? It still works.** With no `ANTHROPIC_API_KEY`, the backend falls
back to a heuristic roaster so the demo never breaks. Add a key to `.env` to get
the real Claude-powered version.

## How it's built

- **Backend** — Express + the Anthropic SDK. One `/api/roast` endpoint. The LLM
  is prompted to return strict JSON, which is then validated and clamped before
  it ever reaches the client — never trust raw model output in your UI.
- **Frontend** — React + Vite + Tailwind. Glassmorphic UI over an animated CSS
  sky. Vite proxies `/api` to the backend, so no CORS and no hardcoded URLs.
- **Graceful degradation** — missing key or a failed API call both fall back to
  the heuristic instead of erroring.

## Stack

`Node` · `Express` · `@anthropic-ai/sdk` · `React` · `Vite` · `Tailwind`