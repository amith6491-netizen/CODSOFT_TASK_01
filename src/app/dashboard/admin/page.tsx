import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/DashboardShell";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
const token = cookieStore.get("edumanage_token")?.value;
  const user = token ? verifyToken(token) : null;

  const [studentCount, teacherCount, classCount, pendingFees, recentStudents] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.classSection.count(),
    prisma.fee.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.student.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, class: true },
    }),
  ]);

  return (
    <DashboardShell role="Administrator" name={user?.email || ""}>
      <h2 style={{ marginTop: 0 }}>School overview</h2>

      <div className="stat-row">
        <div className="stat">
          <div className="value">{studentCount}</div>
          <div className="label">Enrolled students</div>
        </div>
        <div className="stat">
          <div className="value">{teacherCount}</div>
          <div className="label">Teaching staff</div>
        </div>
        <div className="stat">
          <div className="value">{classCount}</div>
          <div className="label">Active classes</div>
        </div>
        <div className="stat">
          <div className="value">{pendingFees}</div>
          <div className="label">Fees pending / overdue</div>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Recently added students</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Admission no.</th>
              <th>Class</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {recentStudents.map((s) => (
              <tr key={s.id}>
                <td>{s.user.name}</td>
                <td>{s.admissionNo}</td>
                <td>{s.class?.name || "Unassigned"}</td>
                <td>{s.user.email}</td>
              </tr>
            ))}
            {recentStudents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--muted)" }}>
                  No students yet. Add one from the accounts API to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Manage accounts</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          New students, teachers, and admins are created via{" "}
          <code>POST /api/auth/register</code>. Fee records are created via{" "}
          <code>POST /api/fees</code>.
        </p>
      </div>
    </DashboardShell>
  );
}
