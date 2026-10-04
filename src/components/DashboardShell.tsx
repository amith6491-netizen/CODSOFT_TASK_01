"use client";

import { useRouter } from "next/navigation";

export default function DashboardShell({
  role,
  name,
  children,
}: {
  role: string;
  name: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <div className="brand-mark" style={{ width: "2.4rem", height: "2.4rem", fontSize: "1rem" }}>E</div>
          <div>
            <span className="brand">EduManage</span>
            <span className="role-tag">{role}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{name}</span>
          <button className="secondary" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
      <div className="content">{children}</div>
    </div>
  );
}
