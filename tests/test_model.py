"""Model loading and inference tests."""

from app.model_loader import (
    FEATURE_COLUMNS,
    MODEL_LOADED,
    MODEL_VERSION,
    metadata,
    model,
)
from app.preprocessing import build_model_input
from app.prediction import run_prediction


REQUIRED_FEATURES = [
    "Applicant_Income",
    "Coapplicant_Income",
    "Employment_Status",
    "Age",
    "Dependents",
    "Existing_Loans",
    "Savings",
    "Collateral_Value",
    "Loan_Amount",
    "Loan_Term",
    "Loan_Purpose",
    "Property_Area",
    "Education_Level",
    "Employer_Category",
    "DTI_Ratio_sq",
    "Credit_Score_sq",
]


def test_model_loads_correctly():
    assert MODEL_LOADED is True
    assert model is not None
    assert hasattr(model, "predict")
    assert hasattr(model, "predict_proba")


def test_metadata_loads_correctly():
    assert isinstance(metadata, dict)
    assert "monthly_interest_rate" in metadata
    assert "feature_columns" in metadata
    assert MODEL_VERSION == "creditwise-realistic-v1"


def test_required_model_features_present():
    for col in REQUIRED_FEATURES:
        assert col in FEATURE_COLUMNS


def test_prediction_is_valid(valid_payload):
    result = run_prediction(valid_payload)
    assert result["prediction"] in ("Approved", "Rejected")
    assert isinstance(result["insights"], list)
    assert "estimatedEmi" in result["calculated"]


def test_probability_between_0_and_1(valid_payload):
    result = run_prediction(valid_payload)
    assert 0.0 <= result["approvalProbability"] <= 1.0
    assert 0.0 <= result["confidence"] <= 1.0


def test_build_model_input_columns(valid_payload):
    df = build_model_input(valid_payload)
    for col in REQUIRED_FEATURES:
        assert col in df.columns
