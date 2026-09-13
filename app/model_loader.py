"""Load trained model artifacts once at import time."""

from pathlib import Path

import joblib

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "model.pkl"
METADATA_PATH = ROOT / "models" / "metadata.pkl"

model = joblib.load(MODEL_PATH)
metadata = joblib.load(METADATA_PATH)
MONTHLY_RATE = float(metadata["monthly_interest_rate"])
FEATURE_COLUMNS = list(metadata.get("feature_columns", []))
MODEL_VERSION = metadata.get("version", "unknown")
MODEL_LOADED = model is not None
