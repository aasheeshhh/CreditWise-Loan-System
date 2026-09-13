"""API endpoint tests."""

import json


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    body = res.get_json()
    assert body["status"] == "healthy"
    assert body["model_loaded"] is True
    assert "model_version" in body


def test_home(client):
    res = client.get("/")
    assert res.status_code == 200
    assert b"CreditWise" in res.data


def test_predict_valid(client, valid_payload):
    res = client.post(
        "/predict",
        data=json.dumps(valid_payload),
        content_type="application/json",
    )
    assert res.status_code == 200
    body = res.get_json()
    assert body["prediction"] in ("Approved", "Rejected")
    assert "approvalProbability" in body
    assert "confidence" in body
    assert isinstance(body["insights"], list)
    assert len(body["insights"]) >= 1
    assert "calculated" in body
    assert "estimatedEmi" in body["calculated"]
    assert body["calculated"]["estimatedEmi"] > 0


def test_predict_invalid_returns_400(client, valid_payload):
    payload = {**valid_payload, "income": 1000}
    res = client.post(
        "/predict",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 400
    body = res.get_json()
    assert "error" in body


def test_predict_malformed_handled_safely(client):
    res = client.post(
        "/predict",
        data="not-json",
        content_type="application/json",
    )
    # silent=True → empty dict → missing fields → 400
    assert res.status_code == 400
    body = res.get_json()
    assert "error" in body


def test_predict_non_numeric_returns_400(client, valid_payload):
    payload = {**valid_payload, "income": "abc"}
    res = client.post(
        "/predict",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert res.status_code == 400
    body = res.get_json()
    assert "error" in body
    # Must not expose traceback / internals
    assert "Traceback" not in body["error"]
    assert "File " not in body["error"]


def test_unexpected_error_does_not_expose_internals(client, monkeypatch, valid_payload):
    def boom(_data):
        raise RuntimeError("secret internal detail xyz")

    monkeypatch.setattr("app.routes.run_prediction", boom)
    res = client.post(
        "/predict",
        data=json.dumps(valid_payload),
        content_type="application/json",
    )
    assert res.status_code == 500
    body = res.get_json()
    assert body["error"] == "Prediction failed. Please check the application inputs."
    assert "secret" not in body["error"]
    assert "xyz" not in body["error"]
