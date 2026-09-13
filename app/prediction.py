"""Model inference and rule-based prediction insights."""

from app.model_loader import model
from app.preprocessing import build_model_input
from app.utils import calculate_emi


def build_insights(data: dict, emi: float, total_income: float) -> list[dict]:
    """
    Rule-based prediction insights derived from applicant inputs.

    These are threshold heuristics for UX explainability — not SHAP values.
    """
    income = float(data.get("income", 0))
    loan_amount = float(data.get("loanAmount", 0))
    dti = emi / total_income

    positives = []
    negatives = []
    if float(data.get("creditScore", 0)) >= 700:
        positives.append("Strong credit score supports approval chances.")
    elif float(data.get("creditScore", 0)) < 600:
        negatives.append("Lower credit score reduces approval chances.")
    if dti <= 0.40:
        positives.append("Estimated EMI-to-income ratio is relatively manageable.")
    elif dti > 0.60:
        negatives.append("Requested EMI is high relative to monthly income.")
    if float(data.get("savings", 0) or 0) >= loan_amount * 0.20:
        positives.append("Savings provide a stronger financial buffer.")
    if loan_amount > income * 60:
        negatives.append("Requested loan is large relative to monthly income.")

    if not positives:
        positives.append("Applicant profile contains some supportive factors.")
    if not negatives:
        negatives.append("No major risk signal crossed the configured explanation thresholds.")

    return [
        *({"type": "positive", "text": text} for text in positives),
        *({"type": "negative", "text": text} for text in negatives),
    ]


def run_prediction(data: dict) -> dict:
    """Validate-free prediction: preprocess → model → insights + EMI."""
    input_df = build_model_input(data)
    prediction = int(model.predict(input_df)[0])
    probability = float(model.predict_proba(input_df)[0][1])

    income = float(data.get("income", 0))
    loan_amount = float(data.get("loanAmount", 0))
    loan_term = int(float(data.get("loanTerm", 0)))
    emi = calculate_emi(loan_amount, loan_term)
    total_income = max(income + float(data.get("coapplicantIncome", 0) or 0), 1.0)
    dti = emi / total_income

    return {
        "prediction": "Approved" if prediction == 1 else "Rejected",
        "approvalProbability": probability,
        "confidence": probability,
        "insights": build_insights(data, emi, total_income),
        "suggestions": [
            "Keep debt obligations manageable relative to monthly income.",
            "Maintain healthy savings and credit history.",
        ],
        "calculated": {
            "estimatedEmi": round(emi, 2),
            "emiToIncomeRatio": round(dti, 4),
        },
    }
