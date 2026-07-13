import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { mockRoast } from "./mock.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-5"; // swap to "claude-haiku-4-5-20251001" for cheaper/faster

// ---- The soul of the product: how the roaster thinks ----
const SYSTEM_PROMPT = `You are the sharp-tongued little sister of SIA, the AI inside SARAL — 
an influencer marketing platform for DTC ecommerce brands. Brands paste in the cold 
DM or email they're about to send an influencer, and you judge it without mercy (but with love).

SARAL's philosophy: stop gambling with influencers. Great outreach is PERSONALIZED, 
VALUE-FIRST, and never desperate. Bad outreach is generic, all-about-the-brand, 
vague on the offer, and reeks of copy-paste. An influencer's inbox is a warzone — 
if the first line doesn't earn attention, they ghost.

You evaluate a message on these axes:
- Personalization: does it prove they actually looked at THIS creator?
- Value clarity: is the offer/ask concrete, or wishy-washy?
- Brevity & scannability: can it be read in 10 seconds?
- Desperation / power balance: does it beg, or does it lead?
- Specific call to action: is the next step obvious and low-friction?

Return your judgment. Be witty and a little savage in the roasts, but every roast 
must point at a REAL, fixable problem. The rewrite must be something the brand could 
actually send today — same core facts, dramatically better delivery.

Respond ONLY with valid JSON, no markdown fences, in exactly this shape:
{
  "ghostScore": <integer 0-100, higher = MORE likely to get ghosted>,
  "verdict": "<punchy one-liner, e.g. 'Instant delete.' or 'Reply-worthy.'>",
  "vibe": "<one of: 'desperate', 'generic', 'decent', 'sharp'>",
  "roasts": [
    {
      "quote": "<the exact weak snippet from their message>",
      "problem": "<what's wrong, one sentence, witty>",
      "fix": "<how to fix it, one sentence>",
      "severity": "<one of: 'minor', 'medium', 'brutal'>"
    }
  ],
  "rewrite": "<the full improved message, ready to send>",
  "whatChanged": ["<short bullet>", "<short bullet>", "<short bullet>"]
}

Give 2-4 roasts. If the message is genuinely great, say so and keep ghostScore low, 
but still find something to sharpen — nothing is perfect.`;

// ---- Pull clean JSON out of the model response, defensively ----
function extractJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model output");
  return JSON.parse(cleaned.slice(start, end + 1));
}

// ---- Make sure the shape is safe before it reaches the frontend ----
function validate(result) {
  const score = Math.max(0, Math.min(100, Math.round(Number(result.ghostScore) || 50)));
  return {
    ghostScore: score,
    verdict: String(result.verdict || "Hard to say.").slice(0, 120),
    vibe: ["desperate", "generic", "decent", "sharp"].includes(result.vibe)
      ? result.vibe
      : "decent",
    roasts: Array.isArray(result.roasts)
      ? result.roasts.slice(0, 4).map((r) => ({
          quote: String(r.quote || "").slice(0, 300),
          problem: String(r.problem || "").slice(0, 240),
          fix: String(r.fix || "").slice(0, 240),
          severity: ["minor", "medium", "brutal"].includes(r.severity)
            ? r.severity
            : "medium",
        }))
      : [],
    rewrite: String(result.rewrite || "").slice(0, 4000),
    whatChanged: Array.isArray(result.whatChanged)
      ? result.whatChanged.slice(0, 5).map((c) => String(c).slice(0, 160))
      : [],
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL, keyLoaded: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.post("/api/roast", async (req, res) => {
    const { message, context } = req.body || {};
  
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return res
        .status(400)
        .json({ error: "Paste an outreach message (at least 10 characters) to roast." });
    }
  
    // No key? Don't fail — fall back to the heuristic so the demo always works.
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json(mockRoast(message));
    }
  
    const userContent = context?.trim()
      ? `Context about the creator/brand: ${context.trim()}\n\nThe outreach message:\n${message.trim()}`
      : `The outreach message:\n${message.trim()}`;
  
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      });
  
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
  
      res.json(validate(extractJson(text)));
    } catch (err) {
      console.error("Live roast failed, serving fallback:", err.message);
      res.json(mockRoast(message)); // graceful: demo continues
    }
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 Outreach roaster brain running on http://localhost:${PORT}`);
});