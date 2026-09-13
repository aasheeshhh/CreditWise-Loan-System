"""Shared fixtures for CreditWise backend tests."""

import pytest

from app.app import app as flask_app


@pytest.fixture
def app():
    flask_app.config.update({"TESTING": True})
    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def valid_payload():
    """A request body inside all backend validation ranges."""
    return {
        "income": 65000,
        "loanAmount": 250000,
        "loanTerm": 60,
        "creditScore": 720,
        "age": 32,
        "coapplicantIncome": 0,
        "existingLoans": 0,
        "savings": 50000,
        "collateralValue": 0,
        "dependents": 0,
        "employmentStatus": "employed",
        "loanPurpose": "personal",
        "propertyArea": "urban",
        "education": "graduate",
        "employerCategory": "private",
    }
