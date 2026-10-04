import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/DashboardShell";

export default async function StudentDashboard() {
  const cookieStore = await cookies();
const token = cookieStore.get("edumanage_token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return null;

  const student = await prisma.student.findUnique({
    where: { userId: payload.userId },
    include: {
      class: true,
      attendance: { orderBy: { date: "desc" }, take: 15 },
      grades: { include: { exam: true }, orderBy: { createdAt: "desc" } },
      fees: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!student) {
    return (
      <DashboardShell role="Student" name={payload.email}>
        <p>No student record found for this account.</p>
      </DashboardShell>
    );
  }

  const presentCount = student.attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = student.attendance.length
    ? Math.round((presentCount / student.attendance.length) * 100)
    : null;

  return (
    <DashboardShell role="Student" name={payload.email}>
      <h2 style={{ marginTop: 0 }}>
        Welcome back{student.class ? ` — ${student.class.name}` : ""}
      </h2>

      <div className="stat-row">
        <div className="stat">
          <div className="value">{attendanceRate !== null ? `${attendanceRate}%` : "—"}</div>
          <div className="label">Attendance (last {student.attendance.length} days)</div>
        </div>
        <div className="stat">
          <div className="value">{student.grades.length}</div>
          <div className="label">Recorded exam results</div>
        </div>
        <div className="stat">
          <div className="value">
            {student.fees.filter((f) => f.status !== "PAID" && f.status !== "WAIVED").length}
          </div>
          <div className="label">Fees due</div>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Recent attendance</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {student.attendance.map((a) => (
              <tr key={a.id}>
                <td>{a.date.toISOString().slice(0, 10)}</td>
                <td>
                  <span className={`status ${a.status.toLowerCase()}`}>{a.status}</span>
                </td>
              </tr>
            ))}
            {student.attendance.length === 0 && (
              <tr>
                <td colSpan={2} style={{ color: "var(--muted)" }}>
                  No attendance recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Exam results</h3>
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Subject</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {student.grades.map((g) => (
              <tr key={g.id}>
                <td>{g.exam.title}</td>
                <td>{g.exam.subject}</td>
                <td>
                  {g.marksObtained} / {g.exam.maxMarks}
                </td>
              </tr>
            ))}
            {student.grades.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "var(--muted)" }}>
                  No exam results yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Fees</h3>
        <table>
          <thead>
            <tr>
              <th>Term</th>
              <th>Amount</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {student.fees.map((f) => (
              <tr key={f.id}>
                <td>{f.term}</td>
                <td>${f.amount.toFixed(2)}</td>
                <td>{f.dueDate.toISOString().slice(0, 10)}</td>
                <td>
                  <span className={`status ${f.status.toLowerCase()}`}>{f.status}</span>
                </td>
              </tr>
            ))}
            {student.fees.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--muted)" }}>
                  No fee records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
