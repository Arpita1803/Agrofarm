from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load TSV dataset (real file is tab-separated)
RAW_DF = pd.read_csv("price_dataset.csv", sep="\t", encoding="utf-8")

# Map raw columns -> canonical columns
# raw: crop_type, state, city, season, month, year, Modal_price
DF = RAW_DF.rename(columns={
    "crop_type": "crop",
    "city": "district",
    "year": "year",
    "month": "month",
    "Modal_price": "modal_price",
    "state": "state",
    "season": "season",
}).copy()

# Basic cleaning/typing
for col in ["crop", "district", "state", "season"]:
    if col in DF.columns:
        DF[col] = DF[col].astype(str).str.strip().str.lower()

DF["month"] = pd.to_numeric(DF["month"], errors="coerce")
DF["year"] = pd.to_numeric(DF["year"], errors="coerce")
DF["modal_price"] = pd.to_numeric(DF["modal_price"], errors="coerce")
DF = DF.dropna(subset=["crop", "district", "month", "year", "modal_price"])


def _validate_payload(data):
    if not isinstance(data, dict):
        return "Invalid JSON payload"

    crop = str(data.get("crop", "")).strip().lower()
    district = str(data.get("district", "")).strip().lower()
    month_raw = data.get("month", None)

    if not crop:
        return "crop is required"
    if not district:
        return "district is required"

    try:
        month = int(month_raw)
    except (TypeError, ValueError):
        return "month must be an integer (1-12)"

    if month < 1 or month > 12:
        return "month must be between 1 and 12"

    return None


def _train_and_predict(filtered_df):
    X = filtered_df[["year"]]
    y = filtered_df["modal_price"]

    model = LinearRegression()
    model.fit(X, y)

    target_year = int(filtered_df["year"].max()) + 1
    predicted_price = float(model.predict([[target_year]])[0])
    return round(predicted_price, 2), target_year


@app.route("/predict-price", methods=["POST"])
def predict_price():
    data = request.get_json(silent=True) or {}
    error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    crop = str(data["crop"]).strip().lower()
    district = str(data["district"]).strip().lower()
    month = int(data["month"])

    # Level 1: exact (crop + district + month)
    exact = DF[
        (DF["crop"] == crop) &
        (DF["district"] == district) &
        (DF["month"] == month)
    ]

    source_level = "district"

    # Level 2 fallback: crop + month + state of district (if identifiable)
    if len(exact) < 2:
        states = DF.loc[DF["district"] == district, "state"].dropna().unique().tolist()
        state_df = pd.DataFrame()
        if states:
            state_df = DF[
                (DF["crop"] == crop) &
                (DF["state"].isin(states)) &
                (DF["month"] == month)
            ]
        if len(state_df) >= 2:
            exact = state_df
            source_level = "state"

    # Level 3 fallback: crop + month (all India/global in dataset)
    if len(exact) < 2:
        global_df = DF[
            (DF["crop"] == crop) &
            (DF["month"] == month)
        ]
        if len(global_df) >= 2:
            exact = global_df
            source_level = "global"

    if len(exact) < 2:
        return jsonify({
            "error": "Not enough data for this crop+district+month",
            "required_min_samples": 2,
            "found_samples": int(len(exact))
        }), 400

    predicted_price, target_year = _train_and_predict(exact)

    return jsonify({
        "predicted_price": predicted_price,
        "unit": "INR/quintal",
        "target_year": target_year,
        "sample_size": int(len(exact)),
        "source_level": source_level,
        "input": {
            "crop": crop,
            "district": district,
            "month": month
        }
    })


if __name__ == "__main__":
    app.run(debug=True)
