"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import AnalysisResult from "@/components/AnalysisResult";
import { AnalysisResponse } from "@/types";

export default function ShareContent() {
  const params = useSearchParams();
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const d = params.get("d");
    if (!d) { setError(true); return; }
    try {
      setResult(JSON.parse(atob(d)));
    } catch {
      setError(true);
    }
  }, [params]);

  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-5 py-16">
        {/* Nav */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#6366f1" }}>
              <Search size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-white tracking-tight">TruthLens</span>
          </div>
          <Link
            href="/"
            className="text-sm px-4 py-2 rounded-lg font-medium"
            style={{ background: "#6366f1", color: "#fff" }}
          >
            Fact-check something →
          </Link>
        </div>

        {error && (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-white mb-2">Invalid share link</p>
            <p className="text-sm mb-6" style={{ color: "#475569" }}>
              This link may be corrupted or too long for your clipboard.
            </p>
            <Link href="/" style={{ color: "#6366f1", fontSize: "14px" }}>
              Go to TruthLens →
            </Link>
          </div>
        )}

        {result && (
          <>
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: "#334155" }}>
              Shared analysis
            </p>
            <AnalysisResult result={result} onReset={() => {}} hideBack />
          </>
        )}
      </div>
    </div>
  );
}
