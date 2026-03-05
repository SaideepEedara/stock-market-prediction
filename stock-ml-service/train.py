import os
import joblib
import yfinance as yf
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

from src.features import add_features

# -------------------------------------------------
# Ensure models folder exists
# -------------------------------------------------
os.makedirs("models", exist_ok=True)

print("📥 Downloading stock data...")

# -------------------------------------------------
# Download data
# -------------------------------------------------
df = yf.download("RELIANCE.NS", start="2018-01-01", end="2024-01-01")

if df.empty:
    raise ValueError("❌ Data download failed. Check internet or symbol.")

# -------------------------------------------------
# Fix MultiIndex from yfinance
# -------------------------------------------------
if isinstance(df.columns, pd.MultiIndex):
    df.columns = df.columns.get_level_values(0)

# -------------------------------------------------
# Feature Engineering
# -------------------------------------------------
print("⚙️ Generating features...")
df = add_features(df)

# -------------------------------------------------
# Create Target
# -------------------------------------------------
df["Target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)
df.dropna(inplace=True)

# -------------------------------------------------
# Split X and y
# -------------------------------------------------
X = df.drop("Target", axis=1)
y = df["Target"]

# -------------------------------------------------
# Save feature names SAFELY (as Python list)
# -------------------------------------------------
feature_columns = list(X.columns)
joblib.dump(feature_columns, "models/feature_columns.pkl")

# -------------------------------------------------
# Scaling
# -------------------------------------------------
print("📊 Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
joblib.dump(scaler, "models/scaler.pkl")

# -------------------------------------------------
# Time-series split
# -------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, shuffle=False
)

# -------------------------------------------------
# Define Models
# -------------------------------------------------
print("🤖 Training hybrid model...")

rf = RandomForestClassifier(n_estimators=200, random_state=42)
xgb = XGBClassifier(eval_metric="logloss", random_state=42)
svm = SVC(probability=True, random_state=42)

model = VotingClassifier(
    estimators=[
        ("rf", rf),
        ("xgb", xgb),
        ("svm", svm),
    ],
    voting="soft",
)

# -------------------------------------------------
# Train
# -------------------------------------------------
model.fit(X_train, y_train)

# -------------------------------------------------
# Evaluate
# -------------------------------------------------
pred = model.predict(X_test)
accuracy = accuracy_score(y_test, pred)

print(f"✅ Model Accuracy: {accuracy:.4f}")

# -------------------------------------------------
# Save model
# -------------------------------------------------
joblib.dump(model, "models/model.pkl")

print("💾 Model saved successfully!")
print("🚀 Training pipeline complete.")