import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/DashboardShell";
import AccountManager from "@/components/AccountManager";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("edumanage_token")?.value;
  const user = token ? verifyToken(token) : null;

  const [studentCount, teacherCount, classCount, pendingFees, allStudents, classes, allTeachers] =
    await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.classSection.count(),
      prisma.fee.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
      prisma.student.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } }, class: true },
      }),
      prisma.classSection.findMany({
        orderBy: [{ gradeYear: "asc" }, { name: "asc" }],
        select: { id: true, name: true, gradeYear: true },
      }),
      prisma.teacher.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          classes: { select: { name: true } },
        },
      }),
    ]);

  return (
    <DashboardShell role="Administrator" name={user?.email || ""}>
      <h2 style={{ marginTop: 0 }}>Institution Administration Overview</h2>

      <div className="stat-row">
        <div className="stat">
          <div className="value">{studentCount}</div>
          <div className="label">Enrolled Students</div>
        </div>
        <div className="stat">
          <div className="value">{teacherCount}</div>
          <div className="label">Faculty Members</div>
        </div>
        <div className="stat">
          <div className="value">{classCount}</div>
          <div className="label">Degree Courses (UG & PG)</div>
        </div>
        <div className="stat">
          <div className="value">{pendingFees}</div>
          <div className="label">Fees Pending / Overdue</div>
        </div>
      </div>

      <AccountManager
        classes={classes}
        initialStudents={allStudents}
        initialTeachers={allTeachers}
      />
    </DashboardShell>
  );
}

