"""Input validation unit tests."""

import pytest

from app.validation import validate_inputs


def _base(**overrides):
    data = {
        "income": 65000,
        "loanAmount": 250000,
        "loanTerm": 60,
        "creditScore": 720,
        "age": 32,
    }
    data.update(overrides)
    return data


def test_valid_input():
    assert validate_inputs(_base()) is None


def test_missing_required_fields():
    err = validate_inputs({"income": 65000})
    assert err is not None
    assert "Missing required fields" in err
    assert "loanAmount" in err


@pytest.mark.parametrize(
    "field,value",
    [
        ("income", None),
        ("loanAmount", ""),
        ("loanTerm", None),
        ("creditScore", ""),
        ("age", None),
    ],
)
def test_empty_or_null_required(field, value):
    data = _base()
    data[field] = value
    err = validate_inputs(data)
    assert err is not None
    assert "Missing required fields" in err


def test_income_below_minimum():
    err = validate_inputs(_base(income=14999))
    assert err is not None
    assert "income" in err.lower()


def test_income_above_maximum():
    err = validate_inputs(_base(income=500_001))
    assert err is not None
    assert "income" in err.lower()


def test_loan_amount_below_minimum():
    err = validate_inputs(_base(loanAmount=49999))
    assert err is not None
    assert "loan amount" in err.lower()


def test_loan_amount_above_maximum():
    err = validate_inputs(_base(loanAmount=15_000_001))
    assert err is not None
    assert "loan amount" in err.lower()


def test_loan_term_below_minimum():
    err = validate_inputs(_base(loanTerm=11))
    assert err is not None
    assert "loan term" in err.lower()


def test_loan_term_above_maximum():
    err = validate_inputs(_base(loanTerm=361))
    assert err is not None
    assert "loan term" in err.lower()


def test_credit_score_below_minimum():
    err = validate_inputs(_base(creditScore=319))
    assert err is not None
    assert "credit score" in err.lower()


def test_credit_score_above_maximum():
    err = validate_inputs(_base(creditScore=851))
    assert err is not None
    assert "credit score" in err.lower()


def test_malformed_non_numeric_input():
    with pytest.raises((TypeError, ValueError)):
        validate_inputs(_base(income="not-a-number"))
