"""Utility helper tests."""

from app.utils import EMPLOYMENT, calculate_emi, normalize_category


def test_calculate_emi_positive():
    emi = calculate_emi(250_000, 60, annual_rate=0.10)
    assert emi > 0


def test_calculate_emi_zero_principal():
    assert calculate_emi(0, 60) == 0.0


def test_normalize_known_and_fallback():
    assert normalize_category("self-employed", EMPLOYMENT, "Salaried") == "Self-employed"
    assert normalize_category("Salaried", EMPLOYMENT, "Salaried") == "Salaried"
    assert normalize_category("unknown-job", EMPLOYMENT, "Salaried") == "Salaried"
    assert normalize_category("", EMPLOYMENT, "Salaried") == "Salaried"
