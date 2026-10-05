import Link from "next/link";
import { prisma } from "@/lib/prisma";

const features = [
  { title: "Attendance", text: "Track class presence in seconds with live status updates." },
  { title: "Exams & Marks", text: "Create assessments and keep year-wise performance history organized." },
  { title: "Fees", text: "Monitor payments, due dates, and pending dues at a glance." },
];

export default async function HomePage() {
  const [studentCount, teacherCount, classCount, pendingFeesCount, totalAttendance, presentAttendance] =
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

  const stats = [
    { value: `${studentCount}`, label: "Enrolled Students" },
    { value: `${classCount}`, label: "Degree Courses (UG & PG)" },
    { value: `${teacherCount}`, label: "Faculty Members" },
  ];

  return (
    <main className="landing-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Higher Education Management</span>
          <h1>One platform for smarter learning and stronger campus administration.</h1>
          <p>
            EduManage connects every student, faculty member, and administrator in one streamlined workspace
            for degree courses, continuous assessments, attendance, and fee tracking.
          </p>
          <div className="cta-row">
            <Link href="/login" className="primary-btn">Sign in</Link>
            <Link href="/login" className="secondary-btn">View dashboard</Link>
          </div>
          <div className="mini-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="mini-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card main-card">
            <span className="status-pill success">Live Database</span>
            <h3>Campus Overview</h3>
            <div className="bar-group">
              <span style={{ width: `${Math.min(100, Math.max(15, studentCount * 20))}%` }} />
              <span style={{ width: `${Math.min(100, Math.max(20, classCount * 4))}%` }} />
              <span style={{ width: `${attendanceRate}%` }} />
            </div>
          </div>
          <div className="visual-card small-card">
            <p>Fees pending</p>
            <strong>{pendingFeesCount}</strong>
          </div>
          <div className="visual-card small-card alt-card">
            <p>Attendance</p>
            <strong>{attendanceRate}%</strong>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card">
            <div className="feature-icon">•</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="feature-grid" style={{ marginTop: "1.6rem" }}>
        {[
          { title: "Unified student view", text: "See admissions, attendance, marks, and fee updates from a single profile." },
          { title: "Teacher workflows", text: "Reduce repetitive admin tasks with clean grading and class management tools." },
          { title: "Leadership visibility", text: "Track trends across the institution with instant performance and operational snapshots." },
        ].map((item) => (
          <article key={item.title} className="feature-card">
            <div className="feature-icon">✦</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
