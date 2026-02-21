const API_URL = "https://truthlens-roan-omega.vercel.app/api/analyze";

const VERDICT_STYLES = {
  True:            { icon: "✓", color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)"  },
  "Mostly True":   { icon: "✓", color: "#86efac", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.2)" },
  "Partially True":{ icon: "~", color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)"  },
  Misleading:      { icon: "!", color: "#fb923c", bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.2)"  },
  "Mostly False":  { icon: "✕", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
  False:           { icon: "✕", color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  Unverified:      { icon: "?", color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.15)"},
};

function scoreColor(n) {
  return n >= 70 ? "#4ade80" : n >= 40 ? "#fbbf24" : "#ef4444";
}

function isArticlePage() {
  return (
    !!document.querySelector("article, [role='article'], .article-body, .story-body, .post-content") ||
    document.querySelectorAll("p").length > 5
  );
}

function extractContent() {
  const title = document.title || "";
  const selectors = [
    "article", '[role="article"]', "main",
    ".article-body", ".story-body", ".article-content",
    ".post-content", ".entry-content", "#article-body",
  ];
  let text = "";
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim().length > 200) { text = el.innerText.trim(); break; }
  }
  if (!text) {
    text = Array.from(document.querySelectorAll("p"))
      .map((p) => p.innerText.trim()).filter((t) => t.length > 40).join("\n");
  }
  return `${title}\n\n${text}`.slice(0, 5000);
}

// --- Badge ---
function createBadge() {
  if (document.getElementById("truthlens-badge")) return;
  if (!isArticlePage()) return;

  const badge = document.createElement("div");
  badge.id = "truthlens-badge";
  badge.innerHTML = `
    <div class="tl-icon">T</div>
    <span class="tl-label">TruthLens</span>
    <span class="tl-status">Check this page</span>
  `;
  document.body.appendChild(badge);
  badge.addEventListener("click", toggleOverlay);
}

// --- Overlay ---
let overlayOpen = false;

function toggleOverlay() {
  if (overlayOpen) {
    removeOverlay();
  } else {
    showOverlay();
  }
}

function removeOverlay() {
  const ov = document.getElementById("truthlens-overlay");
  if (ov) ov.remove();
  overlayOpen = false;
}

function showOverlay() {
  removeOverlay();
  overlayOpen = true;

  const overlay = document.createElement("div");
  overlay.id = "truthlens-overlay";
  overlay.innerHTML = `
    <div class="tl-ov-header">
      <span class="tl-ov-title">TruthLens Analysis</span>
      <button class="tl-ov-close">✕</button>
    </div>
    <div class="tl-ov-body">
      <div class="tl-loading">
        <div class="tl-spinner"></div>
        Analyzing this page...
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector(".tl-ov-close").addEventListener("click", removeOverlay);

  analyzeAndRender(overlay);
}

async function analyzeAndRender(overlay) {
  try {
    const content = extractContent();
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, type: "text" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    renderOverlayResult(overlay, data);

    // Update badge status
    const status = overlay.querySelector
      ? null
      : document.querySelector("#truthlens-badge .tl-status");
    const badgeStatus = document.querySelector("#truthlens-badge .tl-status");
    if (badgeStatus) badgeStatus.textContent = data.analysis.verdict;
  } catch (err) {
    const body = overlay.querySelector(".tl-ov-body");
    if (body) {
      body.innerHTML = `
        <p style="color:#f87171;font-size:12px;padding:8px 0">${err.message}</p>
        <button class="tl-open-btn" onclick="window.open('https://truthlens-roan-omega.vercel.app')">Open TruthLens ↗</button>
      `;
    }
  }
}

function renderOverlayResult(overlay, { analysis, sources }) {
  const style = VERDICT_STYLES[analysis.verdict] || VERDICT_STYLES.Unverified;
  const color = scoreColor(analysis.credibilityScore);

  const body = overlay.querySelector(".tl-ov-body");
  body.innerHTML = `
    <div class="tl-verdict-row" style="background:${style.bg};border:1px solid ${style.border}">
      <div class="tl-verdict-badge" style="color:${style.color}">${style.icon}</div>
      <div>
        <div class="tl-verdict-sub" style="color:${style.color}">Verdict</div>
        <div class="tl-verdict-name" style="color:${style.color}">${analysis.verdict}</div>
      </div>
    </div>
    <p class="tl-summary">${analysis.summary}</p>
    <div class="tl-score-row">
      <span>Credibility</span>
      <span style="color:${color};font-weight:700">${analysis.credibilityScore}/100</span>
    </div>
    <div class="tl-score-track">
      <div class="tl-score-fill" style="width:${analysis.credibilityScore}%;background:${color}"></div>
    </div>
    <button class="tl-open-btn" id="tl-open">Open Full Analysis ↗</button>
  `;

  overlay.querySelector("#tl-open").addEventListener("click", () => {
    window.open("https://truthlens-roan-omega.vercel.app", "_blank");
  });
}

// Init
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createBadge);
} else {
  createBadge();
}
