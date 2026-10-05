import { prisma } from "@/lib/prisma";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const [studentCount, teacherCount, classCount, pendingFees, totalAttendance, presentAttendance] =
    await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.classSection.count(),
      prisma.fee.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
      prisma.attendance.count(),
      prisma.attendance.count({ where: { status: "PRESENT" } }),
    ]);

  const attendanceRate =
    totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

  return (
    <LoginForm
      stats={{
        studentCount,
        teacherCount,
        classCount,
        pendingFees,
        attendanceRate,
      }}
    />
  );
}
