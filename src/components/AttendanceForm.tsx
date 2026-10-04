"use client";

import { useState } from "react";

export default function AttendanceForm({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [status, setStatus] = useState("PRESENT");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        date: new Date().toISOString().slice(0, 10),
        status,
      }),
    });
    setMessage(res.ok ? "Attendance recorded." : "Could not record attendance.");
  }

  if (students.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No students assigned to your classes yet.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", alignItems: "end", flexWrap: "wrap" }}>
      <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
        <label htmlFor="student">Student</label>
        <select id="student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field" style={{ marginBottom: 0, minWidth: 160 }}>
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LATE">Late</option>
          <option value="EXCUSED">Excused</option>
        </select>
      </div>
      <button type="submit">Save</button>
      {message && <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{message}</span>}
    </form>
  );
}
