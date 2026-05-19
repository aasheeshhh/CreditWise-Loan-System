import { createServerFn } from "@tanstack/react-start";
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
  value: number; // contribution
  raw: string;
};

export type PredictResult = {
  prediction: "Approved" | "Rejected";
  confidence: number; // 0..1
  approvalProbability: number;
  shap_values: ShapFeature[];
  feature_importance: { feature: string; importance: number }[];
  insights: { type: "positive" | "negative" | "neutral"; text: string }[];
  suggestions: string[];
};

/**
 * Heuristic ML-like scoring kept identical to existing logic.
 * Preserves backend contract: POST /predict -> { prediction, confidence, shap_values, feature_importance }
 */
export const predictLoan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PredictSchema.parse(input))
  .handler(async ({ data }): Promise<PredictResult> => {
    const totalIncome = data.income + data.coapplicantIncome;
    const dti = data.loanAmount / Math.max(totalIncome * data.loanTerm, 1);
    const ltv = data.collateralValue > 0 ? data.loanAmount / data.collateralValue : 1;
    const liabilityRatio = data.existingLoans / Math.max(totalIncome, 1);

    // Contribution model (mock SHAP)
    const contribs: ShapFeature[] = [
      { feature: "Credit Score", value: (data.creditScore - 650) / 250, raw: String(data.creditScore) },
      { feature: "Income", value: Math.min(totalIncome / 15000, 1) - 0.3, raw: `$${totalIncome.toLocaleString()}` },
      { feature: "Debt-to-Income", value: -Math.min(dti * 8, 1), raw: dti.toFixed(3) },
      { feature: "Employment", value: data.employmentStatus === "employed" ? 0.25 : data.employmentStatus === "self-employed" ? 0.05 : -0.3, raw: data.employmentStatus },
      { feature: "Education", value: data.education === "graduate" ? 0.12 : 0, raw: data.education },
      { feature: "Existing Liabilities", value: -Math.min(liabilityRatio * 4, 0.6), raw: `$${data.existingLoans.toLocaleString()}` },
      { feature: "Savings Buffer", value: Math.min(data.savings / Math.max(data.loanAmount, 1), 0.4), raw: `$${data.savings.toLocaleString()}` },
      { feature: "Collateral (LTV)", value: data.collateralValue > 0 ? Math.max(0.3 - ltv * 0.3, -0.2) : 0, raw: data.collateralValue ? ltv.toFixed(2) : "—" },
      { feature: "Dependents", value: -data.dependents * 0.04, raw: String(data.dependents) },
      { feature: "Property Area", value: data.propertyArea === "urban" ? 0.05 : data.propertyArea === "semiurban" ? 0.02 : -0.03, raw: data.propertyArea },
    ];

    const base = 0.5;
    const logit = contribs.reduce((s, c) => s + c.value, base);
    const probability = 1 / (1 + Math.exp(-logit * 2.2));
    const prediction = probability >= 0.55 ? "Approved" : "Rejected";

    const feature_importance = contribs
      .map((c) => ({ feature: c.feature, importance: Math.abs(c.value) }))
      .sort((a, b) => b.importance - a.importance);

    const insights = contribs
      .slice()
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 4)
      .map((c) => {
        if (c.value > 0.05)
          return { type: "positive" as const, text: `${c.feature} (${c.raw}) positively influenced approval.` };
        if (c.value < -0.05)
          return { type: "negative" as const, text: `${c.feature} (${c.raw}) reduced eligibility.` };
        return { type: "neutral" as const, text: `${c.feature} had a neutral effect.` };
      });

    const suggestions: string[] = [];
    if (data.creditScore < 700) suggestions.push("Improve credit score above 700 for stronger approval odds.");
    if (dti > 0.05) suggestions.push("Consider a longer term or smaller loan amount to lower debt-to-income.");
    if (data.savings < data.loanAmount * 0.1) suggestions.push("Build savings to at least 10% of the loan amount.");
    if (data.existingLoans > totalIncome * 6) suggestions.push("Pay down existing liabilities before applying.");
    if (data.collateralValue === 0 && data.loanAmount > 50000) suggestions.push("Add collateral to secure larger loans.");

    return {
      prediction,
      confidence: Math.max(probability, 1 - probability),
      approvalProbability: probability,
      shap_values: contribs,
      feature_importance,
      insights,
      suggestions,
    };
  });
