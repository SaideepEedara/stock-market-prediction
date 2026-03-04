import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

/* ✅ single source of truth for backend */
const API_BASE = "http://127.0.0.1:5001";

export default function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  /* =====================================================
     ✅ AUTO REDIRECT IF ALREADY LOGGED IN
  ===================================================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  /* =====================================================
     ✅ NORMAL LOGIN / SIGNUP
  ===================================================== */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const url = isSignup
        ? `${API_BASE}/api/auth/signup`
        : `${API_BASE}/api/auth/login`;

      const res = await axios.post(url, form);

      console.log("✅ Response:", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // ✅ PRODUCTION FLOW (NO ALERT)
      if (isSignup) {
        setIsSignup(false); // go back to login
      } else {
        navigate("/dashboard"); // 🚀 redirect
      }
    } catch (err) {
      console.error("❌ Error:", err);

      alert(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     ✅ GOOGLE LOGIN
  ===================================================== */
  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google) {
        console.warn("⚠️ Google script not loaded yet");
        return;
      }

      window.google.accounts.id.initialize({
        client_id:
          "750709352410-r7sc3it5rahbtonoem83tq54mcbdbbmg.apps.googleusercontent.com",
        callback: handleGoogleResponse,
      });

      const btn = document.getElementById("googleBtn");
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: "outline",
          size: "large",
          width: 250,
        });
      }
    };

    const timer = setTimeout(initializeGoogle, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);

      const decoded = JSON.parse(
        atob(response.credential.split(".")[1])
      );

      const res = await axios.post(
        `${API_BASE}/api/auth/google-login`,
        {
          name: decoded.name,
          email: decoded.email,
          googleId: decoded.sub,
        }
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // 🚀 DIRECT REDIRECT (NO ALERT)
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Google login error:", err);

      alert(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          err.message ||
          "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🎨 UI
  ===================================================== */
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

        {isSignup && (
          <input
            placeholder="Name"
            style={styles.input}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        )}

        <input
          placeholder="Email"
          style={styles.input}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Sign Up"
            : "Login"}
        </button>

        <div id="googleBtn" style={{ marginTop: 15 }}></div>

        <p style={{ marginTop: 15 }}>
          {isSignup
            ? "Already have account?"
            : "Don't have account?"}
          <span
            style={styles.link}
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? " Login" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   🎨 STYLES
===================================================== */
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#6C63FF",
  },
  card: {
    background: "white",
    padding: 30,
    borderRadius: 12,
    width: 320,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
  },
  button: {
    width: "100%",
    padding: 12,
    marginTop: 15,
    background: "#6C63FF",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: 6,
    fontWeight: "bold",
  },
  link: {
    color: "#6C63FF",
    cursor: "pointer",
    fontWeight: "bold",
  },
};