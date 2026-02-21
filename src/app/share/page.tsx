import { Suspense } from "react";
import ShareContent from "./ShareContent";

export default function SharePage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#080810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "#6366f1", borderTopColor: "transparent" }} />
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
