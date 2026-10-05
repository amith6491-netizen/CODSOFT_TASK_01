import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/DashboardShell";
import AttendanceForm from "@/components/AttendanceForm";
import MarksEntryForm from "@/components/MarksEntryForm";

export default async function TeacherDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("edumanage_token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return null;

  const [teacher, allClasses] = await Promise.all([
    prisma.teacher.findUnique({
      where: { userId: payload.userId },
      include: {
        classes: { include: { students: { include: { user: true } } } },
        examsCreated: {
          orderBy: { date: "desc" },
          take: 15,
          include: {
            class: true,
            grades: {
              include: {
                student: { include: { user: true } },
              },
            },
          },
        },
      },
    }),
    prisma.classSection.findMany({
      orderBy: [{ gradeYear: "asc" }, { name: "asc" }],
      include: { students: { include: { user: true } } },
    }),
  ]);

  const sortedClasses = [...allClasses].sort((a, b) => {
    const aIsUG = a.name.startsWith("UG");
    const bIsUG = b.name.startsWith("UG");
    if (aIsUG && !bIsUG) return -1;
    if (!aIsUG && bIsUG) return 1;
    return a.name.localeCompare(b.name);
  });

  const activeClasses = teacher?.classes && teacher.classes.length > 0 ? teacher.classes : sortedClasses;
  const allStudents = activeClasses.flatMap((c) => c.students);

  const classesForMarks = sortedClasses.map((c) => ({
    id: c.id,
    name: c.name,
    gradeYear: c.gradeYear,
    students: c.students.map((s) => ({
      id: s.id,
      name: s.user.name,
      admissionNo: s.admissionNo,
      classId: s.classId,
    })),
  }));

  const initialExams = (teacher?.examsCreated || []).map((e) => ({
    id: e.id,
    title: e.title,
    subject: e.subject,
    maxMarks: e.maxMarks,
    date: e.date.toISOString(),
    class: { name: e.class.name },
    grades: e.grades.map((g) => ({
      id: g.id,
      studentId: g.studentId,
      marksObtained: g.marksObtained,
      remarks: g.remarks,
      student: {
        admissionNo: g.student.admissionNo,
        user: { name: g.student.user.name },
      },
    })),
  }));

  return (
    <DashboardShell role="Teacher" name={payload.email}>
      <h2 style={{ marginTop: 0 }}>Faculty Dashboard</h2>

      <div className="stat-row">
        <div className="stat">
          <div className="value">{activeClasses.length}</div>
          <div className="label">Degree Courses Available</div>
        </div>
        <div className="stat">
          <div className="value">{allStudents.length}</div>
          <div className="label">Total Enrolled Students</div>
        </div>
        <div className="stat">
          <div className="value">{teacher?.examsCreated.length ?? 0}</div>
          <div className="label">Assessments Set</div>
        </div>
      </div>

      {/* Marks / Grading Management Panel */}
      <div className="panel" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Student Marks & Assessments</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 0 }}>
          Record exam scores, mid-term tests, and assignment marks for any degree course. Entered marks instantly reflect on the student's dashboard.
        </p>
        <MarksEntryForm
          classes={classesForMarks}
          initialExams={initialExams}
          defaultSubject={teacher?.subject || "Core Subject"}
        />
      </div>

      {/* Attendance Panel */}
      <div className="panel" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Mark Today's Attendance</h3>
        <AttendanceForm students={allStudents.map((s) => ({ id: s.id, name: s.user.name }))} />
      </div>

      {/* Degree Course Rosters */}
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Degree Course Rosters</h3>
        {activeClasses.map((c) => (
          <div key={c.id} style={{ marginBottom: "1.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <strong>{c.name}</strong>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                {c.students.length} student(s) enrolled
              </span>
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "160px" }}>Admission No.</th>
                  <th>Student Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {c.students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <code>{s.admissionNo}</code>
                    </td>
                    <td>
                      <strong>{s.user.name}</strong>
                    </td>
                    <td>{s.user.email}</td>
                  </tr>
                ))}
                {c.students.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ color: "var(--muted)" }}>
                      No students currently assigned to this course.
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

