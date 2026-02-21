const API_URL = "http://localhost:3000/api/analyze";

const VERDICT_STYLES = {
  True:           { icon: "✓",  color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)"  },
  "Mostly True":  { icon: "✓",  color: "#86efac", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.2)" },
  "Partially True":{ icon: "~", color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)"  },
  Misleading:     { icon: "!",  color: "#fb923c", bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.2)"  },
  "Mostly False": { icon: "✕",  color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  False:          { icon: "✕",  color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  Unverified:     { icon: "?",  color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.15)"},
};

function scoreColor(n) {
  return n >= 70 ? "#4ade80" : n >= 40 ? "#fbbf24" : "#ef4444";
}

function showState(id) {
  ["idle-state", "loading-state", "error-state", "result-state"].forEach((s) => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
}

function extractPageContent() {
  const title = document.title || "";
  const selectors = [
    "article",
    '[role="article"]',
    "main",
    ".article-body",
    ".story-body",
    ".article-content",
    ".post-content",
    ".entry-content",
    ".content-body",
    "#article-body",
  ];

  let text = "";
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim().length > 200) {
      text = el.innerText.trim();
      break;
    }
  }

  if (!text) {
    // Fallback: grab visible paragraphs
    text = Array.from(document.querySelectorAll("p"))
      .map((p) => p.innerText.trim())
      .filter((t) => t.length > 40)
      .join("\n")
      .trim();
  }

  return `${title}\n\n${text}`.slice(0, 5000);
}

let currentResult = null;
let currentTab = null;

async function analyze() {
  if (!currentTab) return;
  showState("loading-state");

  try {
    const [{ result: pageContent }] = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: extractPageContent,
    });

    if (!pageContent || pageContent.trim().length < 20) {
      throw new Error("Could not extract enough text from this page.");
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: pageContent, type: "text" }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Analysis failed");

    currentResult = data;
    renderResult(data);
  } catch (err) {
    document.getElementById("error-msg").textContent = err.message;
    showState("error-state");
  }
}

function renderResult({ analysis, sources }) {
  const style = VERDICT_STYLES[analysis.verdict] || VERDICT_STYLES.Unverified;
  const color = scoreColor(analysis.credibilityScore);

  // Verdict card
  const card = document.getElementById("verdict-card");
  card.style.background = style.bg;
  card.style.border = `1px solid ${style.border}`;

  document.getElementById("verdict-icon").textContent = style.icon;
  document.getElementById("verdict-icon").style.color = style.color;
  document.getElementById("verdict-text").textContent = analysis.verdict;
  document.getElementById("verdict-text").style.color = style.color;
  document.getElementById("verdict-summary").textContent = analysis.summary;

  // Score
  document.getElementById("score-num").textContent = `${analysis.credibilityScore}/100`;
  document.getElementById("score-num").style.color = color;
  const fill = document.getElementById("score-fill");
  fill.style.width = "0%";
  fill.style.background = color;
  setTimeout(() => { fill.style.width = `${analysis.credibilityScore}%`; }, 50);

  // Sources
  const sourcesList = document.getElementById("sources-list");
  sourcesList.innerHTML = "";
  if (sources && sources.length > 0) {
    document.getElementById("sources-label").style.display = "block";
    sources.slice(0, 5).forEach((s) => {
      const a = document.createElement("a");
      a.className = "source-chip";
      a.textContent = s.title;
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      sourcesList.appendChild(a);
    });
  }

  showState("result-state");
}

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  try {
    const url = new URL(tab.url);
    document.getElementById("site-badge").textContent = url.hostname.replace("www.", "");
  } catch {
    document.getElementById("site-badge").textContent = "Unknown site";
  }

  // Check for cached result for this tab
  const cached = await chrome.storage.session.get(`result_${tab.id}`).catch(() => ({}));
  if (cached[`result_${tab.id}`]) {
    currentResult = cached[`result_${tab.id}`];
    renderResult(currentResult);
  } else {
    showState("idle-state");
  }

  document.getElementById("analyze-btn").addEventListener("click", analyze);
  document.getElementById("retry-btn").addEventListener("click", analyze);
  document.getElementById("analyze-another").addEventListener("click", () => {
    chrome.storage.session.remove(`result_${tab.id}`).catch(() => {});
    currentResult = null;
    showState("idle-state");
  });

  document.getElementById("open-full-btn").addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:3000" });
  });
});
