import os
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / 'models' / 'model.pkl'
METADATA_PATH = ROOT / 'models' / 'metadata.pkl'

app = Flask(__name__)
_cors_origins = os.environ.get('CORS_ORIGINS', '*')
CORS(app, resources={r'/*': {'origins': [o.strip() for o in _cors_origins.split(',')]}})

model = joblib.load(MODEL_PATH)
metadata = joblib.load(METADATA_PATH)
MONTHLY_RATE = float(metadata['monthly_interest_rate'])


def calculate_emi(principal: float, months: int, annual_rate: float = 0.10) -> float:
    """Calculate monthly EMI using a fixed 10% annual rate for the training/inference feature."""
    if principal <= 0 or months <= 0:
        return 0.0
    r = annual_rate / 12.0
    return principal * r * (1 + r) ** months / ((1 + r) ** months - 1)


def build_model_input(data: dict) -> pd.DataFrame:
    income = float(data.get('income', 0) or 0)
    loan_amount = float(data.get('loanAmount', 0) or 0)
    loan_term = int(float(data.get('loanTerm', 0) or 0))
    co_income = float(data.get('coapplicantIncome', 0) or 0)
    existing_loans = float(data.get('existingLoans', 0) or 0)
    credit_score = float(data.get('creditScore', 0) or 0)

    # IMPORTANT: exactly the same DTI definition used when the new dataset/model were trained:
    # DTI = (new-loan EMI + estimated existing debt service) / total monthly income.
    emi = calculate_emi(loan_amount, loan_term)
    existing_payment = existing_loans * income * 0.065
    total_income = max(income + co_income, 1.0)
    dti = (emi + existing_payment) / total_income

    row = {
        'Applicant_Income': income,
        'Coapplicant_Income': co_income,
        'Age': float(data.get('age', 0) or 0),
        'Dependents': float(data.get('dependents', 0) or 0),
        'Existing_Loans': existing_loans,
        'Savings': float(data.get('savings', 0) or 0),
        'Collateral_Value': float(data.get('collateralValue', 0) or 0),
        'Loan_Amount': loan_amount,
        'Loan_Term': loan_term,
        'Employment_Status': str(data.get('employmentStatus', '')).title(),
        'Loan_Purpose': str(data.get('loanPurpose', '')).title(),
        'Property_Area': str(data.get('propertyArea', '')).title(),
        'Education_Level': str(data.get('education', '')).title(),
        'Employer_Category': str(data.get('employerCategory', '')).title(),
        'DTI_Ratio_sq': dti ** 2,
        'Credit_Score_sq': credit_score ** 2,
    }
    return pd.DataFrame([row])


def validate_inputs(data: dict):
    required_numeric = ['income', 'loanAmount', 'loanTerm', 'creditScore', 'age']
    missing = [k for k in required_numeric if data.get(k) in (None, '')]
    if missing:
        return f'Missing required fields: {", ".join(missing)}'

    income = float(data.get('income', 0))
    loan_amount = float(data.get('loanAmount', 0))
    loan_term = float(data.get('loanTerm', 0))
    credit_score = float(data.get('creditScore', 0))

    if not (15_000 <= income <= 500_000):
        return 'Monthly income is outside the model training range (₹15,000–₹5,00,000).'
    if not (50_000 <= loan_amount <= 15_000_000):
        return 'Loan amount is outside the model training range (₹50,000–₹1.5 crore).'
    if not (12 <= loan_term <= 360):
        return 'Loan term must be between 12 and 360 months.'
    if not (320 <= credit_score <= 850):
        return 'Credit score is outside the model training range (320–850).'
    return None


@app.route('/')
def home():
    return 'CreditWise Backend Running'


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(silent=True) or {}
        validation_error = validate_inputs(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400

        input_df = build_model_input(data)
        prediction = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1])

        income = float(data.get('income', 0))
        loan_amount = float(data.get('loanAmount', 0))
        loan_term = int(float(data.get('loanTerm', 0)))
        emi = calculate_emi(loan_amount, loan_term)
        total_income = max(income + float(data.get('coapplicantIncome', 0) or 0), 1.0)
        dti = emi / total_income

        # Keep explanations truthful and derived from the actual input rather than hard-coded SHAP values.
        positives = []
        negatives = []
        if float(data.get('creditScore', 0)) >= 700:
            positives.append('Strong credit score supports approval chances.')
        elif float(data.get('creditScore', 0)) < 600:
            negatives.append('Lower credit score reduces approval chances.')
        if dti <= 0.40:
            positives.append('Estimated EMI-to-income ratio is relatively manageable.')
        elif dti > 0.60:
            negatives.append('Requested EMI is high relative to monthly income.')
        if float(data.get('savings', 0) or 0) >= loan_amount * 0.20:
            positives.append('Savings provide a stronger financial buffer.')
        if loan_amount > income * 60:
            negatives.append('Requested loan is large relative to monthly income.')

        if not positives:
            positives.append('Applicant profile contains some supportive factors.')
        if not negatives:
            negatives.append('No major risk signal crossed the configured explanation thresholds.')

        return jsonify({
            'prediction': 'Approved' if prediction == 1 else 'Rejected',
            'approvalProbability': probability,
            'confidence': probability,
            'insights': [
                *({'type': 'positive', 'text': text} for text in positives),
                *({'type': 'negative', 'text': text} for text in negatives),
            ],
            'suggestions': [
                'Keep debt obligations manageable relative to monthly income.',
                'Maintain healthy savings and credit history.'
            ],
            'calculated': {
                'estimatedEmi': round(emi, 2),
                'emiToIncomeRatio': round(dti, 4)
            }
        })

    except (TypeError, ValueError) as exc:
        return jsonify({'error': f'Invalid input: {exc}'}), 400
    except Exception as exc:
        app.logger.exception('Prediction failed')
        return jsonify({'error': 'Prediction failed. Please check the application inputs.'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
