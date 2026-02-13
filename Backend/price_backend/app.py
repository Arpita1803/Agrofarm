from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Real dataset is tab-separated
raw_df = pd.read_csv("price_dataset.csv", sep="\t", encoding="utf-8")

# Map raw columns -> canonical columns used in this service
# raw: crop_type, state, city, season, month, year, Modal_price
# canonical: crop, district, month, year, modal_price
df = raw_df.rename(
    columns={
        "crop_type": "crop",
        "city": "district",
        "month": "month",
        "year": "year",
        "Modal_price": "modal_price",
        "state": "state",
        "season": "season",
    }
).copy()

for text_col in ["crop", "district", "state", "season"]:
    if text_col in df.columns:
        df[text_col] = df[text_col].astype(str).str.strip().str.lower()

for num_col in ["month", "year", "modal_price"]:
    df[num_col] = pd.to_numeric(df[num_col], errors="coerce")

df = df.dropna(subset=["crop", "district", "month", "year", "modal_price"])


def validate_payload(payload):
    if not isinstance(payload, dict):
        return "Invalid JSON payload"

    crop = str(payload.get("crop", "")).strip().lower()
    district = str(payload.get("district", "")).strip().lower()
    month_raw = payload.get("month")

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


def train_and_predict(filtered_df):
    X = filtered_df[["year"]]
    y = filtered_df["modal_price"]

    model = LinearRegression()
    model.fit(X, y)

    next_year = int(filtered_df["year"].max()) + 1
    predicted_price = float(model.predict([[next_year]])[0])
    return round(predicted_price, 2), next_year


@app.route("/predict-price", methods=["POST"])
def predict_price():
    data = request.get_json(silent=True) or {}
    error = validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    crop = str(data["crop"]).strip().lower()
    district = str(data["district"]).strip().lower()
    month = int(data["month"])

    # Level 1: exact crop + district + month
    filtered = df[
        (df["crop"] == crop)
        & (df["district"] == district)
        & (df["month"] == month)
    ]
    source_level = "district"

    # Level 2: state fallback for same crop + month
    if len(filtered) < 2:
        states = df.loc[df["district"] == district, "state"].dropna().unique().tolist()
        if states:
            state_filtered = df[
                (df["crop"] == crop)
                & (df["state"].isin(states))
                & (df["month"] == month)
            ]
            if len(state_filtered) >= 2:
                filtered = state_filtered
                source_level = "state"

    # Level 3: global fallback for same crop + month
    if len(filtered) < 2:
        global_filtered = df[(df["crop"] == crop) & (df["month"] == month)]
        if len(global_filtered) >= 2:
            filtered = global_filtered
            source_level = "global"

    if len(filtered) < 2:
        return jsonify(
            {
                "error": "Not enough data for this crop+district+month",
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
            "source_level": source_level,
            "input": {
                "crop": crop,
                "district": district,
                "month": month,
            },
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
