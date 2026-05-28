import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      setAuth(token, user);
      navigate("/library");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-void)",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,160,48,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(22,160,133,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "52px",
              fontWeight: 900,
              color: "var(--color-amber)",
              margin: 0,
              letterSpacing: "-1px",
              lineHeight: 1,
            }}
          >
            Saga
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--color-dim)",
              letterSpacing: "0.15em",
              marginTop: "8px",
              textTransform: "uppercase",
            }}
          >
            Your Media Archive
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-color)",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--color-snow)",
              margin: "0 0 24px",
            }}
          >
            Welcome back
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-dim)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  padding: "12px 14px",
                  background: "var(--color-deep)",
                  border: "1px solid var(--color-border-color)",
                  borderRadius: "8px",
                  color: "var(--color-snow)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-amber)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,160,48,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border-color)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-dim)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  padding: "12px 14px",
                  background: "var(--color-deep)",
                  border: "1px solid var(--color-border-color)",
                  borderRadius: "8px",
                  color: "var(--color-snow)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-amber)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232,160,48,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border-color)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="animate-fade-in"
                style={{
                  padding: "10px 14px",
                  background: "rgba(192, 57, 43, 0.12)",
                  border: "1px solid rgba(192, 57, 43, 0.4)",
                  borderRadius: "7px",
                  color: "#e74c3c",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                padding: "13px",
                background: loading ? "var(--color-muted-bg)" : "var(--color-amber)",
                color: loading ? "var(--color-dim)" : "var(--color-void)",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.18s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid var(--color-dim)",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin-slow 0.8s linear infinite",
                    }}
                  />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            color: "var(--color-dim)",
          }}
        >
          No account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--color-amber)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
