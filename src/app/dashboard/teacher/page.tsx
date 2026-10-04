import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/DashboardShell";
import AttendanceForm from "@/components/AttendanceForm";

export default async function TeacherDashboard() {
  const cookieStore = await cookies();
const token = cookieStore.get("edumanage_token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return null;

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.userId },
    include: {
      classes: { include: { students: { include: { user: true } } } },
      examsCreated: { orderBy: { date: "desc" }, take: 5, include: { class: true } },
    },
  });

  const allStudents = teacher?.classes.flatMap((c) => c.students) ?? [];

  return (
    <DashboardShell role="Teacher" name={payload.email}>
      <h2 style={{ marginTop: 0 }}>Your classes</h2>

      <div className="stat-row">
        <div className="stat">
          <div className="value">{teacher?.classes.length ?? 0}</div>
          <div className="label">Classes taught</div>
        </div>
        <div className="stat">
          <div className="value">{allStudents.length}</div>
          <div className="label">Students total</div>
        </div>
        <div className="stat">
          <div className="value">{teacher?.examsCreated.length ?? 0}</div>
          <div className="label">Recent exams set</div>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Mark today's attendance</h3>
        <AttendanceForm students={allStudents.map((s) => ({ id: s.id, name: s.user.name }))} />
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Class rosters</h3>
        {teacher?.classes.map((c) => (
          <div key={c.id} style={{ marginBottom: "1.2rem" }}>
            <strong>{c.name}</strong>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Admission no.</th>
                </tr>
              </thead>
              <tbody>
                {c.students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.user.name}</td>
                    <td>{s.admissionNo}</td>
                  </tr>
                ))}
                {c.students.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ color: "var(--muted)" }}>
                      No students assigned yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
