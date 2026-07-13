const FLAGS = [
    { rx: /love your content|big fan/i, quote: "I love your content!",
      problem: "Generic flattery every brand opens with — zero proof you watched anything.",
      fix: "Reference one specific post.", severity: "brutal" },
    { rx: /collaborat/i, quote: "we'd love to collaborate",
      problem: "\"Collaborate\" names no offer. It's a shrug in email form.",
      fix: "State the actual deal.", severity: "medium" },
    { rx: /let me know|if you'?re interested/i, quote: "let me know if you're interested",
      problem: "Dumps all the effort on them instead of giving a next step.",
      fix: "Offer a free product, no strings.", severity: "medium" },
    { rx: /we are a brand|we're a brand|our company/i, quote: "we are a brand",
      problem: "All about you, nothing about their audience.",
      fix: "Lead with them, not you.", severity: "medium" },
  ];
  
  export function mockRoast(message) {
    const hits = FLAGS.filter((f) => f.rx.test(message));
    const exclamations = (message.match(/!/g) || []).length;
    const tooShort = message.trim().length < 40;
  
    let score = 30 + hits.length * 14 + Math.min(exclamations * 5, 20) + (tooShort ? 15 : 0);
    score = Math.max(8, Math.min(96, score));
  
    const roasts = hits.slice(0, 3).map(({ quote, problem, fix, severity }) => ({
      quote, problem, fix, severity,
    }));
    if (roasts.length === 0) {
      roasts.push({
        quote: message.trim().slice(0, 60),
        problem: "It's readable, but nothing here earns a reply over the 40 others in their inbox.",
        fix: "Add one line that only THIS creator would get.",
        severity: "minor",
      });
    }
  
    const vibe = score >= 70 ? "desperate" : score >= 45 ? "generic" : "decent";
    const verdict = score >= 70 ? "Instant delete." : score >= 45 ? "Easy to ignore." : "Has a pulse.";
  
    return {
      ghostScore: score,
      verdict,
      vibe,
      roasts,
      rewrite:
        "Hey [name] — your last video on [specific topic] is the reason I'm emailing. " +
        "We make [product] built for exactly your audience. Can I send one over, no strings? " +
        "If it earns a spot in a post, we'll talk affiliate terms that actually respect your time.",
      whatChanged: [
        "Opens with them, not the brand",
        "Concrete, low-friction ask",
        "Removes desperation and filler",
      ],
      demoMode: true,
    };
  }