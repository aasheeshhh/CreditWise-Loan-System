"""Request input validation for /predict."""


def validate_inputs(data: dict):
    required_numeric = ["income", "loanAmount", "loanTerm", "creditScore", "age"]
    missing = [k for k in required_numeric if data.get(k) in (None, "")]
    if missing:
        return f'Missing required fields: {", ".join(missing)}'

    income = float(data.get("income", 0))
    loan_amount = float(data.get("loanAmount", 0))
    loan_term = float(data.get("loanTerm", 0))
    credit_score = float(data.get("creditScore", 0))

    if not (15_000 <= income <= 500_000):
        return "Monthly income is outside the model training range (₹15,000–₹5,00,000)."
    if not (50_000 <= loan_amount <= 15_000_000):
        return "Loan amount is outside the model training range (₹50,000–₹1.5 crore)."
    if not (12 <= loan_term <= 360):
        return "Loan term must be between 12 and 360 months."
    if not (320 <= credit_score <= 850):
        return "Credit score is outside the model training range (320–850)."
    return None
