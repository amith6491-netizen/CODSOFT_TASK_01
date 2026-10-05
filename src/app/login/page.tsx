"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const roleHome: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
};

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed");
        return;
      }
      router.push(roleHome[data.user.role] || "/login");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand-row">
          <div className="brand-mark">E</div>
          <div>
            <div className="brand-name">EduManage</div>
            <p className="tagline">School operations made simple.</p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="identifier">Email or Admission No.</label>
          <input
            id="identifier"
            type="text"
            placeholder="student@edumanage.com or S-2026-001"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {error && <p className="error-text">{error}</p>}

        {/*<p className="hint">
          Demo accounts (after seeding): admin@edumanage.com / teacher@edumanage.com /
          student@edumanage.com — password123
        </p>*/}
      </form>
    </div>
  );
}
