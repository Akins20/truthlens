# TruthLens — AI Misinformation Detector

> Paste any claim, headline, or screenshot — TruthLens cross-references live web sources with AI and returns a credibility verdict in seconds.

## Features

- **Text analysis** — paste any article, headline, or claim
- **URL analysis** — analyze any article directly by URL
- **Image / screenshot analysis** — drop a screenshot of a tweet, WhatsApp message, or news headline; Gemini reads the image and fact-checks it
- **Chrome extension** — floating badge on any webpage; analyze without copy-pasting
- **Live Google Search grounding** — every verdict is backed by real-time web sources
- **Shareable results** — every analysis gets a unique shareable link

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Gemini 2.5 Flash with Google Search grounding
- **UI**: Tailwind CSS v4, Lucide React
- **Testing**: Playwright E2E
- **Extension**: Chrome Manifest V3

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Akins20/truthlens.git
cd truthlens
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
Billing must be enabled on your Google Cloud project (~$0.075 / 1M tokens).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Chrome Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** → select the `extension/` folder

A TruthLens badge appears on article pages. Click it for an instant analysis overlay.
Or click the toolbar icon for the popup.

> For a deployed app, update `API_URL` in `extension/popup.js` and `extension/content.js`.

## Running Tests

```bash
npx playwright test
```

Tests mock the Gemini API — no quota consumed.

## Deploy to Vercel

```bash
npx vercel
```

Add `GEMINI_API_KEY` as an environment variable in the Vercel dashboard.

## Project Structure

```
truthlens/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Main UI (text / URL / image tabs)
│   │   ├── share/              # Shareable result page
│   │   └── api/analyze/        # Gemini API route
│   ├── components/
│   │   └── AnalysisResult.tsx
│   └── types/index.ts
├── extension/                  # Chrome extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html / popup.js
│   ├── content.js / content.css
│   └── icons/
├── tests/                      # Playwright E2E
└── scripts/
    └── generate-icons.js
```

## License

MIT
