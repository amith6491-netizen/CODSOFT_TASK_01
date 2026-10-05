"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const roleHome: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
};

export interface CampusStats {
  studentCount: number;
  teacherCount: number;
  classCount: number;
  pendingFees: number;
  attendanceRate: number;
}

export default function LoginForm({ stats }: { stats: CampusStats }) {
  const router = useRouter();

  // Selected role tab for intelligent guidance & placeholders
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify your credentials.");
        return;
      }
      router.push(roleHome[data.user.role] || "/login");
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Adaptive placeholder & helper text based on active role tab
  const placeholderText =
    selectedRole === "STUDENT"
      ? "Admission No (e.g. S-2026-001) or Email"
      : selectedRole === "TEACHER"
      ? "Faculty Employee ID (e.g. T-1001) or Email"
      : "Administrator Email (e.g. admin@edumanage.com)";

  const fieldHelpText =
    selectedRole === "STUDENT"
      ? "Students can sign in directly using their Student Admission Number or registered email address."
      : selectedRole === "TEACHER"
      ? "Faculty can sign in with their Faculty Employee ID or institutional email."
      : "Administrators sign in using their assigned administrative email credentials.";

  return (
    <div className="login-page-wrapper">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* Main Dual-Column Container */}
      <div className="login-container-card">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: REAL INSTITUTIONAL SHOWCASE */}
        {/* ========================================================================= */}
        <div className="login-showcase">
          <div>
            <div className="showcase-badge">
              <span>🏛️</span>
              <span>EduManage Academic Portal</span>
            </div>

            <h1 className="showcase-heading">
              Empowering Next-Gen Higher Education
            </h1>

            <p className="showcase-subtext">
              Unified digital management for {stats.classCount} Undergraduate & Postgraduate degree programs,
              continuous faculty assessments, and academic transcripts.
            </p>

            <div className="showcase-features">
              <div className="feature-item">
                <div className="feature-icon-box">🎓</div>
                <div className="feature-content">
                  <h4>{stats.classCount} Active Degree Courses</h4>
                  <p>Curricula across B.Tech, BCA, MCA, MBA, M.Tech, and Data Science.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">👥</div>
                <div className="feature-content">
                  <h4>{stats.studentCount} Enrolled Students • {stats.teacherCount} Faculty</h4>
                  <p>Real-time academic records, class rosters, and gradebook management.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">📊</div>
                <div className="feature-content">
                  <h4>{stats.attendanceRate}% Campus Attendance Rate</h4>
                  <p>Continuous assessment tracking and instant gradebook access.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} />
              System Status: Active & Online
            </span>
            <span>Live Campus Database</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: AUTHENTICATION FORM */}
        {/* ========================================================================= */}
        <div className="login-auth-box">
          <div className="login-auth-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.8rem" }}>
              <div
                style={{
                  width: "2.4rem",
                  height: "2.4rem",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, var(--indigo), var(--cyan))",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  boxShadow: "0 8px 18px rgba(47, 74, 199, 0.25)",
                }}
              >
                E
              </div>
              <strong style={{ fontSize: "1.3rem", color: "var(--indigo-deep)", fontFamily: "Outfit, sans-serif" }}>
                EduManage
              </strong>
            </div>
            <h2>Sign in to Portal</h2>
            <p>Select your campus role and enter your credentials.</p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="role-pills-bar">
            <button
              type="button"
              className={`role-pill-btn ${selectedRole === "STUDENT" ? "active" : ""}`}
              onClick={() => {
                setSelectedRole("STUDENT");
                setError(null);
              }}
            >
              <span>🎓</span> Student
            </button>
            <button
              type="button"
              className={`role-pill-btn ${selectedRole === "TEACHER" ? "active" : ""}`}
              onClick={() => {
                setSelectedRole("TEACHER");
                setError(null);
              }}
            >
              <span>👩‍🏫</span> Faculty
            </button>
            <button
              type="button"
              className={`role-pill-btn ${selectedRole === "ADMIN" ? "active" : ""}`}
              onClick={() => {
                setSelectedRole("ADMIN");
                setError(null);
              }}
            >
              <span>🛡️</span> Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="identifier">
                {selectedRole === "STUDENT"
                  ? "Admission No. or Email"
                  : selectedRole === "TEACHER"
                  ? "Faculty Employee ID or Email"
                  : "Administrator Email"}
              </label>
              <div className="input-with-icon">
                <span className="input-icon-prefix">
                  {selectedRole === "STUDENT" ? "🎓" : selectedRole === "TEACHER" ? "👩‍🏫" : "👤"}
                </span>
                <input
                  id="identifier"
                  type="text"
                  className="input-field-custom"
                  placeholder={placeholderText}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <small style={{ color: "var(--muted)", fontSize: "0.73rem", marginTop: "0.35rem", display: "block" }}>
                {fieldHelpText}
              </small>
            </div>

            <div className="field" style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    padding: 0,
                    fontSize: "0.76rem",
                    color: "var(--indigo)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={() => alert("To reset your password, please contact the Campus Administrator at admin@edumanage.com.")}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-with-icon">
                <span className="input-icon-prefix">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input-field-custom"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "1rem 0 1.2rem" }}>
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: "auto", margin: 0, accentColor: "var(--indigo)" }}
              />
              <label htmlFor="remember" style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", cursor: "pointer" }}>
                Keep me signed in on this device
              </label>
            </div>

            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "floatOrb 0.8s linear infinite",
                    }}
                  />
                  Authenticating…
                </>
              ) : (
                <>
                  Sign In to Dashboard <span>→</span>
                </>
              )}
            </button>

            {error && (
              <div className="login-error-alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </form>

          <div style={{ marginTop: "1.8rem", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "1.2rem" }}>
            <Link
              href="/"
              style={{
                fontSize: "0.82rem",
                color: "var(--muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                transition: "color 0.2s ease",
              }}
            >
              <span>←</span> Return to Public Campus Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
