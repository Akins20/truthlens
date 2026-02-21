export type Verdict =
  | "True"
  | "Mostly True"
  | "Partially True"
  | "Misleading"
  | "Mostly False"
  | "False"
  | "Unverified";

export type BiasRating =
  | "Far Left"
  | "Left"
  | "Center-Left"
  | "Center"
  | "Center-Right"
  | "Right"
  | "Far Right"
  | "Unknown";

export type ClaimVerdict = "True" | "False" | "Misleading" | "Unverified";

export interface KeyClaim {
  claim: string;
  verdict: ClaimVerdict;
  explanation: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface Analysis {
  verdict: Verdict;
  credibilityScore: number;
  biasRating: BiasRating;
  summary: string;
  keyClaims: KeyClaim[];
  redFlags: string[];
  whatIsAccurate: string[];
  recommendation: string;
}

export interface AnalysisResponse {
  analysis: Analysis;
  sources: Source[];
}
