import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const ANALYSIS_PROMPT = `You are TruthLens, an expert fact-checker and media literacy analyst. Analyze the provided content for misinformation, bias, and credibility.

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "verdict": "True" | "Mostly True" | "Partially True" | "Misleading" | "Mostly False" | "False" | "Unverified",
  "credibilityScore": <integer 0-100>,
  "biasRating": "Far Left" | "Left" | "Center-Left" | "Center" | "Center-Right" | "Right" | "Far Right" | "Unknown",
  "summary": "<2-3 sentence plain-English analysis>",
  "keyClaims": [
    { "claim": "<specific claim made>", "verdict": "True" | "False" | "Misleading" | "Unverified", "explanation": "<brief explanation with evidence>" }
  ],
  "redFlags": ["<specific concern or warning sign>"],
  "whatIsAccurate": ["<accurate or verified element>"],
  "recommendation": "<one actionable sentence for the reader>"
}

Rules:
- credibilityScore: 0=completely false, 50=highly misleading/unverified, 100=fully verified accurate
- Extract 2-5 key claims from the content
- List 0-5 red flags (empty array if none)
- List 1-4 accurate elements
- Be specific, cite evidence from your search results`;

const IMAGE_PROMPT = `${ANALYSIS_PROMPT}

This is an image (screenshot, photo of a headline, social media post, etc.). Extract all visible text, headlines, and claims from the image, then fact-check them. If it's a screenshot of a social post or article, analyze the claims made in it.`;

function friendlyError(error: unknown): { message: string; status: number } {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("429") || msg.includes("quota")) {
    return { message: "Rate limited — please wait a moment and try again.", status: 429 };
  }
  if (msg.includes("403") || msg.includes("API_KEY")) {
    return { message: "API key issue — check billing is enabled.", status: 403 };
  }
  return { message: "Analysis failed. Please try again.", status: 500 };
}

function parseAnalysis(text: string) {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse model response");
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { content, type } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide content to analyze." },
        { status: 400, headers: CORS }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} } as any],
    });

    let result;

    if (type === "image") {
      // content is a data URL: "data:image/jpeg;base64,..."
      const [header, base64] = content.split(",");
      const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";

      result = await model.generateContent([
        { inlineData: { mimeType, data: base64 } },
        IMAGE_PROMPT,
      ]);
    } else {
      const prefix =
        type === "url"
          ? `Analyze this URL and its content:\n`
          : `Analyze this content:\n`;
      result = await model.generateContent(`${ANALYSIS_PROMPT}\n\n${prefix}${content.trim()}`);
    }

    const response = result.response;
    const text = response.text();

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources =
      groundingMetadata?.groundingChunks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.map((chunk: any) => ({
          title: chunk.web?.title || "Source",
          url: chunk.web?.uri || "",
        }))
        .filter((s: { url: string }) => s.url) ?? [];

    const analysis = parseAnalysis(text);

    return NextResponse.json({ analysis, sources }, { headers: CORS });
  } catch (error) {
    console.error("TruthLens error:", error);
    const { message, status } = friendlyError(error);
    return NextResponse.json({ error: message }, { status, headers: CORS });
  }
}
