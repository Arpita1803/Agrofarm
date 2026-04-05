from pathlib import Path
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATASET_PATH = Path(__file__).with_name("MASTER_DATASET_FINAL.csv")


def load_dataset():
    raw_df = pd.read_csv(DATASET_PATH, encoding="utf-8")

    # Normalize incoming headers (handles casing/extra spaces/BOM)
    normalized = {str(col): str(col).strip().lower() for col in raw_df.columns}
    df = raw_df.rename(columns=normalized).copy()

    # Map known variants from different datasets
    rename_map = {
        "commodity": "crop",
        "crop": "crop",
        "crop_type": "crop",
        "state": "state",
        "month": "month",
        "month_name": "month_name",
        "year": "year",
        "modal_price": "modal_price",
        "modal price": "modal_price",
    }
    df = df.rename(columns={c: rename_map[c] for c in df.columns if c in rename_map})

    required = ["crop", "state", "year", "modal_price"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(
            f"Dataset missing required columns: {missing}. Found columns: {list(df.columns)}"
        )

    for text_col in ["crop", "state", "month_name"]:
        if text_col in df.columns:
            df[text_col] = df[text_col].astype(str).str.strip().str.lower()

    # Build month number in a robust way.
    if "month_name" in df.columns:
        month_from_name = pd.to_datetime(df["month_name"], format="%B", errors="coerce").dt.month
    else:
        month_from_name = pd.Series(index=df.index, dtype="float64")

    month_from_col = pd.Series(index=df.index, dtype="float64")
    if "month" in df.columns:
        month_text = df["month"].astype(str).str.strip()
        month_from_col = pd.to_numeric(month_text, errors="coerce")

        # Example: January-2021
        missing_numeric = month_from_col.isna()
        if missing_numeric.any():
            parsed = pd.to_datetime(month_text[missing_numeric], format="%B-%Y", errors="coerce")
            month_from_col.loc[missing_numeric] = parsed.dt.month

    df["month"] = month_from_name.fillna(month_from_col)

    for num_col in ["month", "year", "modal_price"]:
        df[num_col] = pd.to_numeric(df[num_col], errors="coerce")

    required_for_training = ["crop", "state", "month", "year", "modal_price"]
    return df.dropna(subset=required_for_training)


try:
    df = load_dataset()
except Exception as exc:
    print(f"Dataset load failed: {exc}")
    df = pd.DataFrame()


def validate_payload(payload):
    if not isinstance(payload, dict):
        return "Invalid JSON payload"

    crop = str(payload.get("crop", "")).strip().lower()
    state = str(payload.get("state", "")).strip().lower()
    month_raw = payload.get("month")

    if not crop:
        return "crop is required"
    if not state:
        return "state is required"

    try:
        month = int(month_raw)
    except (TypeError, ValueError):
        return "month must be an integer (1-12)"

    if month < 1 or month > 12:
        return "month must be between 1 and 12"

    return None


def train_and_predict(filtered_df):
    X = filtered_df[["year"]]
    y = filtered_df["modal_price"]

    model = LinearRegression()
    model.fit(X, y)

    next_year = int(filtered_df["year"].max()) + 1
    predicted_price = float(model.predict([[next_year]])[0])
    return round(predicted_price, 2), next_year


@app.route("/prediction-options", methods=["GET"])
def prediction_options():
    if df.empty:
        return jsonify({"error": "Dataset is not loaded correctly on server"}), 500

    states = sorted(df["state"].dropna().unique().tolist())
    crops = sorted(df["crop"].dropna().unique().tolist())

    return jsonify({"states": states, "crops": crops})


@app.route("/predict-price", methods=["POST"])
def predict_price():
    if df.empty:
        return jsonify({"error": "Dataset is not loaded correctly on server"}), 500

    data = request.get_json(silent=True) or {}
    error = validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    crop = str(data["crop"]).strip().lower()
    state = str(data["state"]).strip().lower()
    month = int(data["month"])

    filtered = df[
        (df["crop"] == crop)
        & (df["state"] == state)
        & (df["month"] == month)
    ]

    if len(filtered) < 2:
        return jsonify(
            {
                "error": "Not enough data to predict for the selected crop, state and month.",
                "required_min_samples": 2,
                "found_samples": int(len(filtered)),
            }
        ), 400

    predicted_price, target_year = train_and_predict(filtered)

    return jsonify(
        {
            "predicted_price": predicted_price,
            "unit": "INR/quintal",
            "target_year": target_year,
            "sample_size": int(len(filtered)),
            "source_level": "state",
            "input": {
                "crop": crop,
                "state": state,
                "month": month,
            },
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)