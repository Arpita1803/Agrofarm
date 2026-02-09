from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load dataset
df = pd.read_csv("price_dataset.csv")

@app.route("/predict-price", methods=["POST"])
def predict_price():
    data = request.json

    crop = data["crop"]
    district = data["district"]
    month = data["month"]

    # Filter dataset
    filtered = df[
        (df["Crop"].str.lower() == crop.lower()) &
        (df["District"].str.lower() == district.lower()) &
        (df["Month"].str.lower() == month.lower())
    ]

    if len(filtered) < 2:
        return jsonify({"error": "Not enough data for prediction"}), 400

    X = filtered[["Year"]]
    y = filtered["Modal_Price"]

    model = LinearRegression()
    model.fit(X, y)

    next_year = filtered["Year"].max() + 1
    predicted_price = model.predict([[next_year]])

    return jsonify({
        "predicted_price": round(predicted_price[0], 2),
        "year": int(next_year)
    })

if __name__ == "__main__":
    app.run(debug=True)
