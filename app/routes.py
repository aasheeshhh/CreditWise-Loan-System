"""HTTP routes for the CreditWise API."""

from flask import jsonify, request

from app.model_loader import MODEL_LOADED, MODEL_VERSION
from app.prediction import run_prediction
from app.validation import validate_inputs


def register_routes(app):
    @app.route("/")
    def home():
        return "CreditWise Backend Running"

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify(
            {
                "status": "healthy" if MODEL_LOADED else "degraded",
                "model_loaded": bool(MODEL_LOADED),
                "model_version": MODEL_VERSION,
            }
        )

    @app.route("/predict", methods=["POST"])
    def predict():
        try:
            data = request.get_json(silent=True) or {}
            validation_error = validate_inputs(data)
            if validation_error:
                return jsonify({"error": validation_error}), 400

            result = run_prediction(data)
            return jsonify(result)

        except (TypeError, ValueError) as exc:
            return jsonify({"error": f"Invalid input: {exc}"}), 400
        except Exception:
            app.logger.exception("Prediction failed")
            return jsonify(
                {"error": "Prediction failed. Please check the application inputs."}
            ), 500
