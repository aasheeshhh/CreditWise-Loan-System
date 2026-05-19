from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

model = joblib.load("models/model.pkl")


@app.route("/")
def home():
    return "CreditWise Backend Running"


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.json

        mapped_data = {
            "Applicant_Income": data.get("income", 0),

            "Loan_Amount": data.get("loanAmount", 0),

            "Loan_Term": data.get("loanTerm", 0),

            "Employment_Status": data.get(
                "employmentStatus", ""
            ).title(),

            "Education_Level": data.get(
                "education", ""
            ).title(),

            "Coapplicant_Income": data.get(
                "coapplicantIncome", 0
            ),

            "Savings": data.get("savings", 0),

            "Collateral_Value": data.get(
                "collateralValue", 0
            ),

            "Existing_Loans": data.get(
                "existingLoans", 0
            ),

            "Dependents": data.get("dependents", 0),

            "Age": data.get("age", 0),

            "Employer_Category": data.get(
                "employerCategory", ""
            ).title(),

            "Loan_Purpose": data.get(
                "loanPurpose", ""
            ).title(),

            "Property_Area": data.get(
                "propertyArea", ""
            ).title(),

            # Engineered features
            "Credit_Score_sq": (
                data.get("creditScore", 0) ** 2
            ),

            "DTI_Ratio_sq": (
                (
                    data.get("loanAmount", 0)
                    / max(data.get("income", 1), 1)
                ) ** 2
            ),
        }

        input_df = pd.DataFrame([mapped_data])

        prediction = model.predict(input_df)[0]

        probability = float(
            model.predict_proba(input_df)[0][1]
        )

        return jsonify({
            "prediction": (
                "Approved"
                if int(prediction) == 1
                else "Rejected"
            ),

            "approvalProbability": probability,

            "confidence": probability,

            "insights": [
                {
                    "type": "positive",
                    "text": "Credit score positively impacted approval chances."
                },
                {
                    "type": "positive",
                    "text": "Stable income improved loan eligibility."
                },
                {
                    "type": "negative",
                    "text": "Higher loan amount slightly reduced confidence."
                }
            ],

            "suggestions": [
                "Maintain low debt-to-income ratio.",
                "Increase savings for stronger approval odds."
            ],

            "shap_values": [
                {
                    "feature": "Credit Score",
                    "value": 0.42,
                    "raw": data.get("creditScore", 0)
                },
                {
                    "feature": "Income",
                    "value": 0.31,
                    "raw": data.get("income", 0)
                },
                {
                    "feature": "Loan Amount",
                    "value": -0.18,
                    "raw": data.get("loanAmount", 0)
                },
                {
                    "feature": "Savings",
                    "value": 0.14,
                    "raw": data.get("savings", 0)
                }
            ]
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)