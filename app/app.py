"""Flask application entrypoint (gunicorn: app.app:app)."""

import os

from flask import Flask
from flask_cors import CORS

from app.routes import register_routes

app = Flask(__name__)

# Production: set CORS_ORIGINS to the deployed frontend origin(s), comma-separated.
# Local development defaults to "*" so Vite / direct API calls keep working.
_cors_origins = os.environ.get("CORS_ORIGINS", "*")
CORS(app, resources={r"/*": {"origins": [o.strip() for o in _cors_origins.split(",")]}})

register_routes(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
