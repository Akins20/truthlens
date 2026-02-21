import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TruthLens: AI Misinformation Detector",
  description:
    "Paste any claim, headline, or screenshot. TruthLens cross-references live web sources with AI and returns a credibility verdict in seconds.",
  keywords: ["fact check", "misinformation", "fake news", "credibility", "AI"],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "TruthLens: AI Misinformation Detector",
    description:
      "Paste any claim, headline, or screenshot. TruthLens cross-references live web sources with AI and returns a credibility verdict in seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  );
}
