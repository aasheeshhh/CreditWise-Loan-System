"""Feature engineering for model inference."""

import pandas as pd

from app.utils import (
    EDUCATION,
    EMPLOYER,
    EMPLOYMENT,
    LOAN_PURPOSE,
    PROPERTY,
    calculate_emi,
    normalize_category,
)


def build_model_input(data: dict) -> pd.DataFrame:
    income = float(data.get("income", 0) or 0)
    loan_amount = float(data.get("loanAmount", 0) or 0)
    loan_term = int(float(data.get("loanTerm", 0) or 0))
    co_income = float(data.get("coapplicantIncome", 0) or 0)
    existing_loans = float(data.get("existingLoans", 0) or 0)
    credit_score = float(data.get("creditScore", 0) or 0)

    # IMPORTANT: exactly the same DTI definition used when the new dataset/model were trained:
    # DTI = (new-loan EMI + estimated existing debt service) / total monthly income.
    emi = calculate_emi(loan_amount, loan_term)
    existing_payment = existing_loans * income * 0.065
    total_income = max(income + co_income, 1.0)
    dti = (emi + existing_payment) / total_income

    row = {
        "Applicant_Income": income,
        "Coapplicant_Income": co_income,
        "Age": float(data.get("age", 0) or 0),
        "Dependents": float(data.get("dependents", 0) or 0),
        "Existing_Loans": existing_loans,
        "Savings": float(data.get("savings", 0) or 0),
        "Collateral_Value": float(data.get("collateralValue", 0) or 0),
        "Loan_Amount": loan_amount,
        "Loan_Term": loan_term,
        "Employment_Status": normalize_category(
            data.get("employmentStatus"), EMPLOYMENT, "Salaried"
        ),
        "Loan_Purpose": normalize_category(
            data.get("loanPurpose"), LOAN_PURPOSE, "Personal"
        ),
        "Property_Area": normalize_category(
            data.get("propertyArea"), PROPERTY, "Urban"
        ),
        "Education_Level": normalize_category(
            data.get("education"), EDUCATION, "Graduate"
        ),
        "Employer_Category": normalize_category(
            data.get("employerCategory"), EMPLOYER, "Private"
        ),
        "DTI_Ratio_sq": dti**2,
        "Credit_Score_sq": credit_score**2,
    }
    return pd.DataFrame([row])
