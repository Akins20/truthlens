"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Flag,
  Check,
  Globe,
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  Share2,
} from "lucide-react";
import { AnalysisResponse, Verdict, ClaimVerdict } from "@/types";
import { useState } from "react";

interface Props {
  result: AnalysisResponse;
  onReset: () => void;
  hideBack?: boolean;
}

const VERDICT_CONFIG: Record<
  Verdict,
  {
    label: string;
    color: string;
    dimColor: string;
    border: string;
    bg: string;
    Icon: React.ElementType;
  }
> = {
  True: {
    label: "True",
    color: "#4ade80",
    dimColor: "rgba(74,222,128,0.7)",
    border: "rgba(74,222,128,0.2)",
    bg: "rgba(74,222,128,0.05)",
    Icon: CheckCircle2,
  },
  "Mostly True": {
    label: "Mostly True",
    color: "#86efac",
    dimColor: "rgba(134,239,172,0.7)",
    border: "rgba(134,239,172,0.2)",
    bg: "rgba(134,239,172,0.05)",
    Icon: CheckCircle2,
  },
  "Partially True": {
    label: "Partially True",
    color: "#fbbf24",
    dimColor: "rgba(251,191,36,0.7)",
    border: "rgba(251,191,36,0.2)",
    bg: "rgba(251,191,36,0.05)",
    Icon: AlertTriangle,
  },
  Misleading: {
    label: "Misleading",
    color: "#fb923c",
    dimColor: "rgba(251,146,60,0.7)",
    border: "rgba(251,146,60,0.2)",
    bg: "rgba(251,146,60,0.05)",
    Icon: AlertTriangle,
  },
  "Mostly False": {
    label: "Mostly False",
    color: "#f87171",
    dimColor: "rgba(248,113,113,0.7)",
    border: "rgba(248,113,113,0.2)",
    bg: "rgba(248,113,113,0.05)",
    Icon: XCircle,
  },
  False: {
    label: "False",
    color: "#ef4444",
    dimColor: "rgba(239,68,68,0.7)",
    border: "rgba(239,68,68,0.2)",
    bg: "rgba(239,68,68,0.05)",
    Icon: XCircle,
  },
  Unverified: {
    label: "Unverified",
    color: "#94a3b8",
    dimColor: "rgba(148,163,184,0.7)",
    border: "rgba(148,163,184,0.15)",
    bg: "rgba(148,163,184,0.05)",
    Icon: HelpCircle,
  },
};

const CLAIM_CONFIG: Record<
  ClaimVerdict,
  { color: string; bg: string; label: string }
> = {
  True: { color: "#4ade80", bg: "rgba(74,222,128,0.08)", label: "True" },
  False: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", label: "False" },
  Misleading: { color: "#fb923c", bg: "rgba(251,146,60,0.08)", label: "Misleading" },
  Unverified: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", label: "Unverified" },
};

const BIAS_SLOTS = [
  "Far Left",
  "Left",
  "Center-Left",
  "Center",
  "Center-Right",
  "Right",
  "Far Right",
];

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "#4ade80" : score >= 40 ? "#fbbf24" : "#ef4444";

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-widest" style={{ color: "#334155" }}>
          Credibility
        </span>
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {score}
          <span className="text-sm font-normal ml-0.5" style={{ color: "#475569" }}>/100</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${score}%`,
            background: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

function BiasIndicator({ rating }: { rating: string }) {
  const idx = BIAS_SLOTS.indexOf(rating);
  const active = idx !== -1 ? idx : 3;

  return (
    <div>
      <span className="text-xs uppercase tracking-widest mb-3 block" style={{ color: "#334155" }}>
        Political Bias
      </span>
      <div className="flex gap-1">
        {BIAS_SLOTS.map((slot, i) => (
          <div key={slot} className="flex-1">
            <div
              className="h-1 rounded-full mb-1.5"
              style={{
                background:
                  i === active
                    ? i <= 1
                      ? "#60a5fa"
                      : i >= 5
                      ? "#f87171"
                      : "#a78bfa"
                    : "rgba(255,255,255,0.06)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: "#334155" }}>Left</span>
        <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{rating}</span>
        <span className="text-xs" style={{ color: "#334155" }}>Right</span>
      </div>
    </div>
  );
}

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{
        background: "#0f0f1a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#334155" }}>
      {children}
    </p>
  );
}

export default function AnalysisResult({ result, onReset, hideBack }: Props) {
  const { analysis, sources } = result;
  const cfg = VERDICT_CONFIG[analysis.verdict] ?? VERDICT_CONFIG.Unverified;
  const { Icon } = cfg;
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const encoded = btoa(JSON.stringify(result));
    const url = `${window.location.origin}/share?d=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        {!hideBack ? (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "#334155" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#64748b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
          >
            <ArrowLeft size={14} /> Analyze another
          </button>
        ) : <div />}

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: copied ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${copied ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)"}`,
            color: copied ? "#4ade80" : "#64748b",
          }}
        >
          <Share2 size={12} />
          {copied ? "Link copied!" : "Share"}
        </button>
      </div>

      {/* Verdict card */}
      <div
        className="rounded-xl p-6"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <div className="flex items-start gap-4">
          <Icon size={28} color={cfg.color} strokeWidth={1.5} className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: cfg.dimColor }}>
              Verdict
            </p>
            <h2 className="text-3xl font-bold mb-3" style={{ color: cfg.color }}>
              {cfg.label}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              {analysis.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Score + Bias row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section>
          <ScoreBar score={analysis.credibilityScore} />
        </Section>
        <Section>
          <BiasIndicator rating={analysis.biasRating} />
        </Section>
      </div>

      {/* Key claims */}
      {analysis.keyClaims.length > 0 && (
        <Section>
          <SectionLabel>Claims Examined</SectionLabel>
          <div className="space-y-3">
            {analysis.keyClaims.map((c, i) => {
              const cc = CLAIM_CONFIG[c.verdict] ?? CLAIM_CONFIG.Unverified;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-3"
                  style={{
                    borderBottom:
                      i < analysis.keyClaims.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 mt-0.5 tabular-nums"
                    style={{ background: cc.bg, color: cc.color }}
                  >
                    {cc.label}
                  </span>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#e2e8f0" }}>
                      {c.claim}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
                      {c.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Red flags + Accurate */}
      {(analysis.redFlags.length > 0 || analysis.whatIsAccurate.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.redFlags.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.12)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Flag size={14} color="#f87171" />
                <SectionLabel>Red Flags</SectionLabel>
              </div>
              <ul className="space-y-2.5">
                {analysis.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: "#ef4444" }} />
                    <span className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                      {flag}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.whatIsAccurate.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "rgba(74,222,128,0.04)",
                border: "1px solid rgba(74,222,128,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Check size={14} color="#4ade80" />
                <SectionLabel>What&apos;s Accurate</SectionLabel>
              </div>
              <ul className="space-y-2.5">
                {analysis.whatIsAccurate.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: "#4ade80" }} />
                    <span className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      <div
        className="rounded-xl p-5 flex items-start gap-3"
        style={{
          background: "rgba(99,102,241,0.05)",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <Lightbulb size={16} color="#818cf8" className="shrink-0 mt-0.5" />
        <div>
          <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: "#4338ca" }}>
            Recommendation
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            {analysis.recommendation}
          </p>
        </div>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <Section>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={14} color="#334155" />
            <SectionLabel>Sources Searched</SectionLabel>
          </div>
          <div className="space-y-1.5">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg transition-all"
                style={{
                  color: "#475569",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#a5b4fc";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#475569";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                }}
              >
                <TrendingUp size={11} className="shrink-0" />
                <span className="truncate">{s.title}</span>
              </a>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
