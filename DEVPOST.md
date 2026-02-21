# TruthLens — Devpost Submission Content

---

## Tagline
Paste any claim, headline, or screenshot — TruthLens cross-references live web sources with AI and returns a credibility verdict in seconds.

---

## Inspiration
Misinformation spreads faster than the truth — especially through screenshots, forwarded messages, and out-of-context headlines. Existing fact-checkers require you to manually search databases or wait days for human reviewers. We wanted something that works *right now*, on any piece of content, anywhere you find it.

The rise of AI-generated content makes this even more urgent. You should be able to drop a screenshot of a suspicious tweet and get an honest, source-backed verdict in seconds — not days.

---

## What it does
TruthLens is an AI-powered misinformation detector with three input modes:

1. **Text** — paste any article, social post, headline, or claim
2. **URL** — analyze any article directly from its link
3. **Image / Screenshot** — drop a screenshot of a tweet, WhatsApp forward, or news image. Gemini reads the text in the image and fact-checks it

For each input, TruthLens returns:
- A **verdict** (True / Mostly True / Partially True / Misleading / Mostly False / False / Unverified)
- A **credibility score** (0–100)
- A **political bias rating** (Far Left → Far Right)
- **Key claims** extracted and checked individually
- **Red flags** and **what's accurate**
- **Live sources** from real-time Google Search
- A shareable link to the analysis

There's also a **Chrome extension** that adds a TruthLens badge to any article or news page — click it without ever leaving the site.

---

## How we built it
- **Next.js 15** (App Router) for the web app
- **Gemini 2.5 Flash** via `@google/generative-ai` for AI analysis
- **Google Search grounding** — every verdict is backed by real-time web results, not just training data
- **Tailwind CSS v4** + **Lucide React** for the UI
- **Chrome Manifest V3** for the browser extension
- **Playwright** for E2E testing

The architecture is simple: the user's input (text, URL, or base64 image) is sent to a Next.js API route, which builds a structured prompt and calls Gemini 2.5 Flash with the `googleSearch` grounding tool. Gemini searches the web in real-time and returns a structured JSON analysis. The grounding metadata includes the actual source URLs used.

---

## Challenges we ran into
- **Model deprecation**: `gemini-2.0-flash` was deprecated for new API keys mid-build. Discovered by testing the endpoint directly and pivoted to `gemini-2.5-flash`.
- **SDK type lag**: The `@google/generative-ai` SDK types didn't yet include `googleSearch` as a valid tool (only `googleSearchRetrieval`, which is deprecated for new models). Used a type assertion to bridge the gap.
- **Chrome extension CORS**: Content scripts can't make cross-origin API calls directly. Solved by adding CORS headers to the Next.js API route (`Access-Control-Allow-Origin: *`).
- **Image size limits**: Full-resolution screenshots can be several MB. Implemented client-side preview and send only the data URI to keep requests manageable.

---

## Accomplishments that we're proud of
- **Image analysis**: Being able to drop a screenshot of a tweet or WhatsApp message and get it fact-checked is genuinely novel. That's how misinformation actually spreads — as screenshots — and no text-only tool handles it.
- **Chrome extension**: A floating badge that works on any website, without copy-pasting, changes the UX completely. Judges can see it work live on real news sites.
- **Real-time grounding**: Unlike tools that rely on AI training data alone, every verdict cites live sources from Google Search fetched at analysis time.

---

## What we learned
- Gemini's multimodal capabilities are more powerful than expected — feeding a screenshot directly and getting a structured fact-check back in one API call is remarkable.
- Browser extension development with Manifest V3 is significantly more constrained than V2 (no background pages, service workers only, strict CSP), but manageable with the right architecture.
- The hardest part of a fact-checking tool isn't the AI — it's the prompt engineering that gets back consistent, parseable JSON with the right level of nuance.

---

## What's next for TruthLens
- **Firefox extension** support
- **Vercel deployment** with a public URL so the extension doesn't require a local server
- **History** — localStorage-based log of past analyses
- **Browser highlights** — content script that highlights suspicious sentences directly in articles
- **API access** — public endpoint so developers can integrate TruthLens into their own apps
- **Real-time social monitoring** — scan trending hashtags and flag viral misinformation proactively

---

## Demo Video Script (1–2 min)

```
[0:00] Open browser, visit a news article about a controversial health claim
[0:10] Click TruthLens badge in bottom-right corner of the page
[0:15] Overlay appears, "Analyzing..." spinner
[0:25] Results appear: "Misleading — 34/100"
       Show key claims, red flags, sources from WHO/CDC
[0:40] Close overlay, go to TruthLens web app
[0:45] Switch to Image tab, drag in a screenshot of a fake tweet
[0:50] "Analyzing..." — Gemini reads the image
[1:00] Verdict: "False — 8/100" with sources
[1:05] Click Share — copy the link — open it in a new tab
[1:10] Shareable page shows the same result
[1:15] Brief recap of features + stack
```

---

## Built with
Next.js · Gemini 2.5 Flash · Google Search Grounding · Tailwind CSS · Lucide React · Chrome Extension API · Playwright
