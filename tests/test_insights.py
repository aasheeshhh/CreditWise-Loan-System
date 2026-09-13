"""Rule-based insight generation tests."""

from app.prediction import build_insights


def test_low_credit_and_high_dti_insights():
    insights = build_insights(
        {"income": 20000, "loanAmount": 1_500_000, "creditScore": 500, "savings": 0},
        emi=15000,
        total_income=20000,
    )
    texts = " ".join(i["text"] for i in insights)
    assert "credit score" in texts.lower()
    assert any(i["type"] == "negative" for i in insights)


def test_strong_profile_insights():
    insights = build_insights(
        {"income": 80000, "loanAmount": 200000, "creditScore": 750, "savings": 100000},
        emi=4000,
        total_income=80000,
    )
    texts = " ".join(i["text"] for i in insights)
    assert "credit score" in texts.lower()
    assert "savings" in texts.lower()
