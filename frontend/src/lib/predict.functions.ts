import { z } from "zod";

/** Client schema aligned with backend validation ranges in app/validation.py */
const PredictSchema = z.object({
  income: z.number().min(15_000).max(500_000),
  loanAmount: z.number().min(50_000).max(15_000_000),
  creditScore: z.number().min(320).max(850),
  loanTerm: z.number().min(12).max(360),
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
  calculated?: {
    estimatedEmi: number;
    emiToIncomeRatio: number;
  };
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

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "Please check your inputs and try again.";
  const field = first.path.join(".") || "input";
  return `${field}: ${first.message}`;
}

/** Map low-level fetch/Zod failures to human-readable messages. */
export function toUserFacingError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return formatZodError(error);
  }

  if (error instanceof TypeError) {
    // Typical browser message when the API is unreachable / CORS blocked.
    return "Unable to reach the prediction service. Please check your connection and try again.";
  }

  if (error instanceof Error && error.message) {
    const msg = error.message;
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      return "Unable to reach the prediction service. Please check your connection and try again.";
    }
    if (/VITE_API_URL/i.test(msg)) {
      return "The prediction API is not configured. Please contact the site administrator.";
    }
    if (/Prediction failed \(5\d\d\)/i.test(msg)) {
      return "The prediction service ran into an unexpected error. Please try again shortly.";
    }
    return msg;
  }

  return "Something went wrong. Please try again.";
}

export async function predictLoan(data: PredictInput): Promise<PredictResult> {
  let payload: PredictInput;
  try {
    payload = PredictSchema.parse(data);
  } catch (error) {
    throw new Error(toUserFacingError(error));
  }

  const url = `${getApiBaseUrl()}/predict`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(toUserFacingError(error));
  }

  if (!response.ok) {
    let message = `Prediction failed (${response.status})`;
    try {
      const errJson = (await response.json()) as { error?: unknown };
      if (errJson?.error != null) message = String(errJson.error);
    } catch {
      // Non-JSON error body — keep status message.
    }
    if (response.status >= 500) {
      throw new Error(
        "The prediction service ran into an unexpected error. Please try again shortly.",
      );
    }
    throw new Error(message);
  }

  let json: Record<string, unknown>;
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new Error("Received an invalid response from the prediction service.");
  }

  if (json.prediction == null && json.approvalProbability == null) {
    throw new Error("Received an incomplete response from the prediction service.");
  }

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

  const insights = Array.isArray(json.insights) ? (json.insights as PredictResult["insights"]) : [];

  const suggestions = Array.isArray(json.suggestions) ? (json.suggestions as string[]) : [];

  const calculated =
    json.calculated && typeof json.calculated === "object"
      ? (json.calculated as PredictResult["calculated"])
      : undefined;

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
    calculated,
  };
}
