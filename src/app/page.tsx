import Link from "next/link";

const features = [
  { title: "Attendance", text: "Track class presence in seconds with live status updates." },
  { title: "Exams", text: "Create assessments and keep performance history organized." },
  { title: "Fees", text: "Monitor payments, due dates, and pending dues at a glance." },
];

const stats = [
  { value: "3.4k", label: "Students" },
  { value: "98%", label: "Attendance rate" },
  { value: "24/7", label: "Access" },
];

export default function HomePage() {
  return (
    <main className="landing-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">School operations, simplified</span>
          <h1>One platform for smarter learning and stronger school management.</h1>
          <p>
            EduManage connects every student, teacher, and administrator in one streamlined workspace
            for attendance, grading, fee tracking, and academic visibility.
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
            <span className="status-pill success">Live insights</span>
            <h3>School overview</h3>
            <div className="bar-group">
              <span style={{ width: "82%" }} />
              <span style={{ width: "74%" }} />
              <span style={{ width: "91%" }} />
            </div>
          </div>
          <div className="visual-card small-card">
            <p>Fees pending</p>
            <strong>28</strong>
          </div>
          <div className="visual-card small-card alt-card">
            <p>Attendance</p>
            <strong>96.4%</strong>
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
