import ta
import pandas as pd


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds technical indicators and engineered features
    required by the stock prediction model.
    """

    # -------------------------------------------------
    # 🔧 Fix MultiIndex from yfinance (very important)
    # -------------------------------------------------
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # -------------------------------------------------
    # 🔧 Ensure required columns exist
    # -------------------------------------------------
    required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
    df = df[required_cols].copy()

    # Convert to numeric safely
    df = df.apply(pd.to_numeric, errors="coerce")

    # -------------------------------------------------
    # 📈 Trend Indicators
    # -------------------------------------------------
    df['SMA_20'] = ta.trend.sma_indicator(df['Close'], window=20)
    df['SMA_50'] = ta.trend.sma_indicator(df['Close'], window=50)
    df['EMA_20'] = ta.trend.ema_indicator(df['Close'], window=20)
    df['MACD'] = ta.trend.macd(df['Close'])

    # -------------------------------------------------
    # ⚡ Momentum Indicators
    # -------------------------------------------------
    df['RSI'] = ta.momentum.rsi(df['Close'], window=14)
    df['CCI'] = ta.trend.cci(df['High'], df['Low'], df['Close'], window=20)

    # -------------------------------------------------
    # 🌪 Volatility Indicator
    # -------------------------------------------------
    df['ATR'] = ta.volatility.average_true_range(
        df['High'], df['Low'], df['Close'], window=14
    )

    # -------------------------------------------------
    # 📊 Volume Indicator
    # -------------------------------------------------
    df['OBV'] = ta.volume.on_balance_volume(df['Close'], df['Volume'])

    # -------------------------------------------------
    # ⏳ Lag Features
    # -------------------------------------------------
    df['Close_Lag1'] = df['Close'].shift(1)
    df['Close_Lag2'] = df['Close'].shift(2)

    # -------------------------------------------------
    # 🔁 Returns
    # -------------------------------------------------
    df['Return'] = df['Close'].pct_change()

    # -------------------------------------------------
    # 🧹 Final cleanup
    # -------------------------------------------------
    df.dropna(inplace=True)

    return df