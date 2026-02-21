"use client";

import { useState, useRef, useCallback } from "react";
import { Search, FileText, Link2, Image, ArrowRight, RotateCcw, Upload } from "lucide-react";
import AnalysisResult from "@/components/AnalysisResult";
import { AnalysisResponse } from "@/types";

type InputMode = "text" | "url" | "image";

const EXAMPLES = [
  "Scientists confirm drinking apple cider vinegar cures type 2 diabetes permanently",
  "NASA admits moon landing footage was filmed in a studio by Stanley Kubrick",
  "New Stanford study: Wearing masks causes 40% increase in CO2 poisoning",
  "Bill Gates microchips found in COVID-19 vaccine batches by independent lab",
];

const MODES: { id: InputMode; label: string; Icon: React.ElementType }[] = [
  { id: "text",  label: "Text",  Icon: FileText },
  { id: "url",   label: "URL",   Icon: Link2    },
  { id: "image", label: "Image", Icon: Image    },
];

export default function Home() {
  const [mode, setMode] = useState<InputMode>("text");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, []);

  async function handleAnalyze() {
    if (mode === "image" && !imagePreview) return;
    if (mode !== "image" && !content.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body =
        mode === "image"
          ? { content: imagePreview, type: "image" }
          : { content: content.trim(), type: mode };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setContent("");
    setImageFile(null);
    setImagePreview(null);
  }

  const canSubmit =
    mode === "image" ? !!imagePreview : !!content.trim();

  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <div className="relative max-w-3xl mx-auto px-5 py-20">

        {/* Header */}
        <header className="mb-14">
          <div className="flex items-center gap-2.5 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#6366f1" }}
            >
              <Search size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white tracking-tight">TruthLens</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight" style={{ color: "#f1f5f9" }}>
            Is it true?
          </h1>
          <p className="text-lg max-w-md" style={{ color: "#64748b", lineHeight: "1.6" }}>
            Paste text, drop a URL, or upload a screenshot. TruthLens cross-references
            live web sources and returns a verdict in seconds.
          </p>
        </header>

        {!result && !loading && (
          <>
            {/* Mode tabs */}
            <div className="inline-flex rounded-lg p-1 mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              {MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
                  style={{
                    background: mode === id ? "#1e1e2e" : "transparent",
                    color: mode === id ? "#e2e8f0" : "#475569",
                    border: mode === id ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div
              className="rounded-xl overflow-hidden mb-3"
              style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#0f0f1a" }}
            >
              {mode === "text" && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the article, headline, or claim here..."
                  rows={6}
                  className="w-full p-4 text-sm resize-none bg-transparent"
                  style={{ color: "#cbd5e1", lineHeight: "1.75", caretColor: "#6366f1" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
                  }}
                />
              )}

              {mode === "url" && (
                <input
                  type="url"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full p-4 text-sm bg-transparent"
                  style={{ color: "#cbd5e1", caretColor: "#6366f1" }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
                />
              )}

              {mode === "image" && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                  className="relative cursor-pointer"
                  style={{
                    minHeight: "180px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: dragging ? "rgba(99,102,241,0.06)" : "transparent",
                    borderBottom: imagePreview ? "1px solid rgba(255,255,255,0.06)" : "none",
                    transition: "background 0.15s",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                  />
                  {imagePreview ? (
                    <div className="relative w-full p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full rounded-lg object-contain"
                        style={{ maxHeight: "260px" }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#94a3b8" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-10">
                      <Upload size={28} className="mx-auto mb-3" style={{ color: "#334155" }} />
                      <p className="text-sm font-medium mb-1" style={{ color: "#475569" }}>
                        Drop a screenshot here
                      </p>
                      <p className="text-xs" style={{ color: "#334155" }}>
                        or click to browse · PNG, JPG, WEBP
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer bar */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs" style={{ color: "#334155" }}>
                  {mode === "text" && `${content.length} chars · Ctrl+Enter to submit`}
                  {mode === "url" && "Full URL required"}
                  {mode === "image" && (imageFile ? imageFile.name : "Supports screenshots of tweets, articles, messages")}
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={!canSubmit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: canSubmit ? "#6366f1" : "rgba(255,255,255,0.05)",
                    color: canSubmit ? "#fff" : "#334155",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                  }}
                >
                  Analyze <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Examples — only shown for text mode */}
            {mode === "text" && (
              <div className="mt-10">
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#334155" }}>
                  Test with known misinformation
                </p>
                <div className="space-y-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => { setMode("text"); setContent(ex); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-start gap-3"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        color: "#64748b",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                        e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                        e.currentTarget.style.color = "#94a3b8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.color = "#64748b";
                      }}
                    >
                      <span style={{ color: "#334155", marginTop: "1px" }}>→</span>
                      <span>{ex}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "image" && (
              <p className="text-xs mt-4" style={{ color: "#334155" }}>
                Try dropping a screenshot of a tweet, WhatsApp forward, news headline, or any image containing a claim.
              </p>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 mb-6 flex items-start gap-3"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            <div className="flex-1">
              <p className="text-sm font-medium mb-0.5" style={{ color: "#f87171" }}>Analysis failed</p>
              <p className="text-sm" style={{ color: "#64748b" }}>{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
            >
              <RotateCcw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-24">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
              />
              <span className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                {mode === "image" ? "Reading image & searching the web..." : "Searching the web..."}
              </span>
            </div>
            <p className="text-sm pl-8" style={{ color: "#334155" }}>
              Cross-referencing live sources and building your verdict
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <AnalysisResult result={result} onReset={handleReset} />
        )}

        <footer className="mt-20 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-xs" style={{ color: "#1e293b" }}>
            Powered by Gemini 2.5 Flash · Google Search grounding · Always verify with primary sources
          </p>
        </footer>
      </div>
    </div>
  );
}
