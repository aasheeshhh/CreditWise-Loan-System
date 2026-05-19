import { z } from "zod";

const PredictSchema = z.object({
  income: z.number().min(0),
  loanAmount: z.number().min(0),
  creditScore: z.number().min(300).max(850),
  loanTerm: z.number().min(1).max(480),
  employmentStatus: z.string(),
  education: z.string(),
  coapplicantIncome: z.number().min(0).default(0),
  savings: z.number().min(0).default(0),
  collateralValue: z.number().min(0).default(0),
  existingLoans: z.number().min(0).default(0),
  dependents: z.number().min(0).default(0),
  age: z.number().min(18).max(100).default(30),
  employerCategory: z.string().default("private"),
  loanPurpose: z.string().default("personal"),
  propertyArea: z.string().default("urban"),
});

export type PredictInput = z.infer<typeof PredictSchema>;

export type ShapFeature = {
  feature: string;
  value: number;
  raw: string | number;
};

export type PredictResult = {
  prediction: "Approved" | "Rejected";
  confidence: number;
  approvalProbability: number;
  shap_values: ShapFeature[];
  feature_importance?: { feature: string; importance: number }[];
  insights: { type: "positive" | "negative" | "neutral"; text: string }[];
  suggestions: string[];
};

/**
 * Development: Vite proxies /api → http://localhost:5000 (see vite.config.ts).
 * Optional VITE_API_URL in .env.local overrides the proxy for remote API testing.
 * Production: VITE_API_URL is required (set in Netlify/Vercel).
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (import.meta.env.DEV) {
    if (envUrl) return envUrl.replace(/\/$/, "");
    return "/api";
  }

  if (!envUrl) {
    throw new Error(
      "VITE_API_URL is not configured. Set it in your hosting provider environment variables.",
    );
  }

  return envUrl.replace(/\/$/, "");
}

function normalizePrediction(value: unknown): "Approved" | "Rejected" {
  if (value === "Approved" || value === 1 || value === "1") return "Approved";
  return "Rejected";
}

function normalizeShapRaw(raw: unknown): string | number {
  if (typeof raw === "number" || typeof raw === "string") return raw;
  return String(raw ?? "");
}

export async function predictLoan(data: PredictInput): Promise<PredictResult> {
  const payload = PredictSchema.parse(data);
  const url = `${getApiBaseUrl()}/predict`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(errBody || `Prediction failed (${response.status})`);
  }

  const json = (await response.json()) as Record<string, unknown>;

  const approvalProbability =
    typeof json.approvalProbability === "number"
      ? json.approvalProbability
      : typeof json.confidence === "number"
        ? json.confidence
        : 0.5;

  const confidence =
    typeof json.confidence === "number"
      ? json.confidence
      : Math.max(approvalProbability, 1 - approvalProbability);

  const shap_values = Array.isArray(json.shap_values)
    ? (json.shap_values as ShapFeature[]).map((s) => ({
        feature: String(s.feature),
        value: Number(s.value),
        raw: normalizeShapRaw(s.raw),
      }))
    : [];

  const insights = Array.isArray(json.insights)
    ? (json.insights as PredictResult["insights"])
    : [];

  const suggestions = Array.isArray(json.suggestions)
    ? (json.suggestions as string[])
    : [];

  return {
    prediction: normalizePrediction(json.prediction),
    confidence,
    approvalProbability,
    shap_values,
    feature_importance: Array.isArray(json.feature_importance)
      ? (json.feature_importance as PredictResult["feature_importance"])
      : undefined,
    insights,
    suggestions,
  };
}
