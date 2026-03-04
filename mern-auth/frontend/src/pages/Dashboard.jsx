import React, { useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8001/predict";

const Dashboard = () => {
  const navigate = useNavigate();

  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState("candle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // decode user from token
  const token = localStorage.getItem("token");
  let username = "User";

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      username = decoded.name || decoded.email;
    } catch {}
  }

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(API_URL, { symbol });

      if (res.data.error) {
        setError(res.data.error);
        return;
      }

      setResult(res.data);
      setChartData(res.data.chart || []);
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const candleOptions = {
    chart: {
      type: "candlestick",
      background: "#1e1e2f",
      toolbar: { show: true }
    },
    theme: { mode: "dark" },
    xaxis: { type: "datetime" }
  };

  const lineOptions = {
    chart: {
      type: "line",
      background: "#1e1e2f"
    },
    theme: { mode: "dark" },
    xaxis: { type: "datetime" }
  };

  const candleSeries = [
    {
      data: chartData.map((d) => ({
        x: new Date(d.date).getTime(),
        y: [d.open, d.high, d.low, d.close]
      }))
    }
  ];

  const lineSeries = [
    {
      name: "Close Price",
      data: chartData.map((d) => ({
        x: new Date(d.date).getTime(),
        y: d.close
      }))
    }
  ];

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <h2> Dashboard</h2>

        <div style={styles.navRight}>
          <span style={styles.profile}>👤 {username}</span>
          <button style={styles.logout} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <h1 style={styles.title}>Stock Market Prediction</h1>

        {/* SEARCH */}
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol (TCS.NS)"
          />

          <button style={styles.button} onClick={handlePredict}>
            {loading ? "Predicting..." : "Predict"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* RESULT */}
        {result && (
          <div style={styles.resultRow}>
            <div style={styles.cardGreen}>
              <h3>Prediction</h3>
              <h1>
                {result.prediction === 1 ? "📈 UP" : "📉 DOWN"}
              </h1>
            </div>

            <div style={styles.cardBlue}>
              <h3>UP Confidence</h3>
              <h1>
                {(result.confidence_up * 100).toFixed(2)}%
              </h1>
            </div>

            <div style={styles.cardRed}>
              <h3>DOWN Confidence</h3>
              <h1>
                {(result.confidence_down * 100).toFixed(2)}%
              </h1>
            </div>
          </div>
        )}

        {/* CHART SWITCH */}
        <div style={styles.chartToggle}>
          <button
            style={styles.toggleBtn}
            onClick={() => setChartType("candle")}
          >
            Candlestick
          </button>

          <button
            style={styles.toggleBtn}
            onClick={() => setChartType("line")}
          >
            Line Chart
          </button>
        </div>

        {/* CHART */}
        {chartData.length > 0 && (
          <div style={styles.chartBox}>
            {chartType === "candle" ? (
              <Chart
                options={candleOptions}
                series={candleSeries}
                type="candlestick"
                height={400}
              />
            ) : (
              <Chart
                options={lineOptions}
                series={lineSeries}
                type="line"
                height={400}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1f1c2c,#928dab)"
  },

  navbar: {
    height: 70,
    background: "#141421",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px"
  },

  navRight: {
    display: "flex",
    gap: 20,
    alignItems: "center"
  },

  profile: {
    fontWeight: "bold"
  },

  logout: {
    background: "#ff4d4f",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    color: "white",
    cursor: "pointer"
  },

  container: {
    padding: 40,
    maxWidth: 1200,
    margin: "0 auto"
  },

  title: {
    color: "white"
  },

  searchRow: {
    display: "flex",
    gap: 10,
    marginTop: 20
  },

  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "none"
  },

  button: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: 8,
    cursor: "pointer"
  },

  resultRow: {
    display: "flex",
    gap: 20,
    marginTop: 30
  },

  cardGreen: {
    flex: 1,
    background: "#16a34a",
    padding: 20,
    borderRadius: 10,
    color: "white",
    textAlign: "center"
  },

  cardBlue: {
    flex: 1,
    background: "#2563eb",
    padding: 20,
    borderRadius: 10,
    color: "white",
    textAlign: "center"
  },

  cardRed: {
    flex: 1,
    background: "#dc2626",
    padding: 20,
    borderRadius: 10,
    color: "white",
    textAlign: "center"
  },

  chartToggle: {
    marginTop: 30,
    display: "flex",
    gap: 10
  },

  toggleBtn: {
    background: "#0ea5e9",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    color: "white",
    cursor: "pointer"
  },

  chartBox: {
    marginTop: 20,
    background: "#1e1e2f",
    padding: 20,
    borderRadius: 10
  },

  error: {
    color: "red",
    marginTop: 10
  }
};