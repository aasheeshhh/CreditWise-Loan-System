"""Shared helpers for EMI and categorical normalization."""

# Map UI / API values onto the exact categorical labels used when the model was trained.
EMPLOYMENT = {
    "employed": "Salaried",
    "salaried": "Salaried",
    "self-employed": "Self-employed",
    "self employed": "Self-employed",
    "unemployed": "Unemployed",
    "contract": "Contract",
    "student": "Unemployed",
}
EDUCATION = {
    "graduate": "Graduate",
    "not graduate": "Not Graduate",
    "not_graduate": "Not Graduate",
    "undergraduate": "Not Graduate",
    "highschool": "Not Graduate",
    "high school": "Not Graduate",
}
LOAN_PURPOSE = {
    "personal": "Personal",
    "home": "Home",
    "auto": "Car",
    "car": "Car",
    "education": "Education",
    "business": "Business",
}
EMPLOYER = {
    "private": "Private",
    "public": "Public",
    "public sector": "Public",
    "government": "Government",
    "startup": "Other",
    "freelance": "Other",
    "other": "Other",
}
PROPERTY = {
    "urban": "Urban",
    "semiurban": "Semiurban",
    "semi-urban": "Semiurban",
    "semi urban": "Semiurban",
    "rural": "Rural",
}


def normalize_category(value, mapping: dict, fallback: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return fallback
    key = raw.lower().replace("_", " ").replace("-", " ")
    key = " ".join(key.split())
    # Also try hyphenated form used by the frontend (e.g. self-employed).
    key_hyphen = key.replace(" ", "-")
    if key in mapping:
        return mapping[key]
    if key_hyphen in mapping:
        return mapping[key_hyphen]
    # Already a trained label (case-insensitive).
    for trained in mapping.values():
        if raw.lower() == trained.lower():
            return trained
    return fallback


def calculate_emi(principal: float, months: int, annual_rate: float = 0.10) -> float:
    """Calculate monthly EMI using a fixed 10% annual rate for the training/inference feature."""
    if principal <= 0 or months <= 0:
        return 0.0
    r = annual_rate / 12.0
    return principal * r * (1 + r) ** months / ((1 + r) ** months - 1)
