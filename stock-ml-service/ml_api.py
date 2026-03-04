# -------------------------------------------------
# Imports
# -------------------------------------------------
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import yfinance as yf
import joblib
import pandas as pd
from src.features import add_features

# -------------------------------------------------
# 🔧 Fix Python path so 'src' can be imported
# -------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURRENT_DIR)

# -------------------------------------------------
# FastAPI app
# -------------------------------------------------
app = FastAPI()

# -------------------------------------------------
# ✅ CORS — VERY IMPORTANT
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Load model artifacts ONCE
# -------------------------------------------------
model = joblib.load("models/model.pkl")
scaler = joblib.load("models/scaler.pkl")
feature_columns = joblib.load("models/feature_columns.pkl")

# -------------------------------------------------
# Request schema
# -------------------------------------------------
class StockRequest(BaseModel):
    symbol: str


# -------------------------------------------------
# Health check
# -------------------------------------------------
@app.get("/")
def home():
    return {"message": "Stock ML API running 🚀"}


# -------------------------------------------------
# 🔥 MAIN PREDICTION ENDPOINT
# -------------------------------------------------
@app.post("/predict")
def predict_stock(data: StockRequest):
    symbol = data.symbol.strip().upper()

    try:
        # =============================
        # 1️⃣ Download stock data
        # =============================
        df = yf.download(symbol, period="2y")

        if df.empty:
            return {"error": "Invalid stock symbol"}

        # =============================
        # 2️⃣ Fix MultiIndex (yfinance bug)
        # =============================
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        # =============================
        # 3️⃣ Prepare chart data (CRITICAL)
        # =============================
        chart_df = df.tail(120).reset_index()

        chart_data = []
        for _, row in chart_df.iterrows():
            chart_data.append({
                "date": str(row["Date"]),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
            })

        # =============================
        # 4️⃣ Feature engineering
        # =============================
        df_feat = add_features(df.copy())
        df_feat.dropna(inplace=True)

        if df_feat.empty:
            return {"error": "Not enough data after feature engineering"}

        # =============================
        # 5️⃣ Ensure feature alignment
        # =============================
        for col in feature_columns:
            if col not in df_feat.columns:
                df_feat[col] = 0

        df_feat = df_feat[feature_columns]

        # =============================
        # 6️⃣ Scale
        # =============================
        X_scaled = scaler.transform(df_feat)
        last_row = X_scaled[-1].reshape(1, -1)

        # =============================
        # 7️⃣ Predict
        # =============================
        pred = model.predict(last_row)[0]
        prob = model.predict_proba(last_row)[0]

        # =============================
        # ✅ FINAL RESPONSE
        # =============================
        return {
            "prediction": int(pred),
            "confidence_up": float(prob[1]),
            "confidence_down": float(prob[0]),
            "symbol": symbol,
            "chart": chart_data,  # ⭐ REQUIRED FOR FRONTEND
        }

    except Exception as e:
        return {"error": str(e)}