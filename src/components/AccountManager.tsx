"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ClassOption {
  id: string;
  name: string;
  gradeYear: number;
}

export interface StudentItem {
  id: string;
  admissionNo: string;
  class?: { name: string } | null;
  user: {
    name: string;
    email: string;
  };
}

export interface TeacherItem {
  id: string;
  employeeId: string;
  subject: string;
  user: {
    name: string;
    email: string;
  };
  classes?: { name: string }[];
}

export default function AccountManager({
  classes: initialClasses,
  initialStudents,
  initialTeachers,
}: {
  classes: ClassOption[];
  initialStudents: StudentItem[];
  initialTeachers: TeacherItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"STUDENTS" | "TEACHERS" | "COURSES">("STUDENTS");
  const [creationMode, setCreationMode] = useState<"SINGLE" | "BATCH">("SINGLE");

  const [classesList, setClassesList] = useState<ClassOption[]>(initialClasses);
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdSummary, setCreatedSummary] = useState<any[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Single Student State
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    admissionNo: "",
    password: "password123",
    classId: initialClasses[0]?.id || "",
    guardianName: "",
    guardianPhone: "",
  });

  // Batch Students State
  const [batchStudentCount, setBatchStudentCount] = useState(5);
  const [batchClassId, setBatchClassId] = useState(initialClasses[0]?.id || "");
  const [batchPassword, setBatchPassword] = useState("password123");
  const [batchNamesText, setBatchNamesText] = useState("");
  const [batchPrefix, setBatchPrefix] = useState("S-2026");

  // Single Teacher State
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    employeeId: "",
    subject: "Computer Science",
    password: "password123",
    phone: "",
  });

  // Batch Teachers State
  const [batchTeacherCount, setBatchTeacherCount] = useState(3);
  const [batchTeacherPassword, setBatchTeacherPassword] = useState("password123");
  const [batchTeacherNamesText, setBatchTeacherNamesText] = useState("");

  // New Degree Course State
  const [courseForm, setCourseForm] = useState({
    programLevel: "UG",
    courseTitle: "B.Tech Computer Science",
    year: 1,
    teacherId: initialTeachers[0]?.id || "",
  });

  // Class filtering helpers
  const ugClasses = classesList.filter(
    (c) =>
      c.name.startsWith("UG") ||
      c.name.toLowerCase().includes("b.") ||
      c.name.toLowerCase().includes("bca") ||
      c.name.toLowerCase().includes("bba") ||
      c.name.toLowerCase().includes("btech") ||
      c.name.toLowerCase().includes("b.tech")
  );

  const pgClasses = classesList.filter(
    (c) =>
      c.name.startsWith("PG") ||
      c.name.toLowerCase().includes("m.") ||
      c.name.toLowerCase().includes("mca") ||
      c.name.toLowerCase().includes("mba") ||
      c.name.toLowerCase().includes("mtech") ||
      c.name.toLowerCase().includes("m.tech")
  );

  const otherClasses = classesList.filter((c) => !ugClasses.includes(c) && !pgClasses.includes(c));

  // Suggest next admission number
  function getSuggestedAdmissionNo() {
    const numbers = students
      .map((s) => {
        const match = s.admissionNo.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `S-2026-${String(max + 1).padStart(3, "0")}`;
  }

  // Suggest next teacher employee ID
  function getSuggestedEmployeeId() {
    const numbers = teachers
      .map((t) => {
        const match = t.employeeId.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 1000;
      })
      .filter((n) => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `T-${max + 1}`;
  }

  async function handleSingleStudentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setCreatedSummary([]);
    setLoading(true);

    try {
      const payload = {
        role: "STUDENT",
        name: studentForm.name,
        email: studentForm.email,
        admissionNo: studentForm.admissionNo.trim(),
        password: studentForm.password,
        classId: studentForm.classId || null,
        guardianName: studentForm.guardianName || null,
        guardianPhone: studentForm.guardianPhone || null,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create student");
        return;
      }

      setSuccessMessage(`Student "${data.name}" enrolled successfully!`);
      setCreatedSummary([
        {
          name: data.name,
          identifier: data.admissionNo,
          email: data.email,
          password: studentForm.password,
          role: "STUDENT",
        },
      ]);

      const newStudent: StudentItem = {
        id: data.id,
        admissionNo: data.admissionNo,
        class: classesList.find((c) => c.id === studentForm.classId)
          ? { name: classesList.find((c) => c.id === studentForm.classId)!.name }
          : null,
        user: { name: data.name, email: data.email },
      };
      setStudents([newStudent, ...students]);

      setStudentForm({
        name: "",
        email: "",
        admissionNo: "",
        password: "password123",
        classId: classesList[0]?.id || "",
        guardianName: "",
        guardianPhone: "",
      });

      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBatchStudentsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setCreatedSummary([]);
    setLoading(true);

    try {
      const numbers = students
        .map((s) => {
          const match = s.admissionNo.match(/(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const maxCurrent = numbers.length > 0 ? Math.max(...numbers) : 0;

      let namesList = batchNamesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      if (namesList.length === 0) {
        namesList = Array.from(
          { length: batchStudentCount },
          (_, i) => `Student ${maxCurrent + i + 1}`
        );
      }

      const batchPayload = namesList.map((name, i) => {
        const num = maxCurrent + i + 1;
        const admissionNo = `${batchPrefix}-${String(num).padStart(3, "0")}`;
        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const email = `${sanitized || "student"}${num}@edumanage.com`;

        return {
          role: "STUDENT",
          name,
          email,
          admissionNo,
          password: batchPassword,
          classId: batchClassId || null,
        };
      });

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchPayload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create batch students");
        return;
      }

      setSuccessMessage(`Successfully enrolled ${data.count} students!`);
      setCreatedSummary(
        data.users.map((u: any) => ({
          name: u.name,
          identifier: u.admissionNo,
          email: u.email,
          password: batchPassword,
          role: "STUDENT",
        }))
      );

      const addedStudents: StudentItem[] = data.users.map((u: any) => ({
        id: u.id,
        admissionNo: u.admissionNo,
        class: classesList.find((c) => c.id === batchClassId)
          ? { name: classesList.find((c) => c.id === batchClassId)!.name }
          : null,
        user: { name: u.name, email: u.email },
      }));
      setStudents([...addedStudents, ...students]);
      setBatchNamesText("");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during batch enrollment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSingleTeacherSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setCreatedSummary([]);
    setLoading(true);

    try {
      const payload = {
        role: "TEACHER",
        name: teacherForm.name,
        email: teacherForm.email,
        employeeId: teacherForm.employeeId.trim(),
        subject: teacherForm.subject.trim(),
        password: teacherForm.password,
        phone: teacherForm.phone || null,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create teacher");
        return;
      }

      setSuccessMessage(`Faculty member "${data.name}" added successfully!`);
      setCreatedSummary([
        {
          name: data.name,
          identifier: data.employeeId,
          email: data.email,
          password: teacherForm.password,
          role: "TEACHER",
        },
      ]);

      const newTeacher: TeacherItem = {
        id: data.id,
        employeeId: data.employeeId,
        subject: data.subject,
        user: { name: data.name, email: data.email },
      };
      setTeachers([newTeacher, ...teachers]);

      setTeacherForm({
        name: "",
        email: "",
        employeeId: "",
        subject: "Computer Science",
        password: "password123",
        phone: "",
      });

      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBatchTeachersSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setCreatedSummary([]);
    setLoading(true);

    try {
      const numbers = teachers
        .map((t) => {
          const match = t.employeeId.match(/(\d+)$/);
          return match ? parseInt(match[1], 10) : 1000;
        })
        .filter((n) => !isNaN(n));
      const maxCurrent = numbers.length > 0 ? Math.max(...numbers) : 1000;

      let namesList = batchTeacherNamesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      if (namesList.length === 0) {
        namesList = Array.from({ length: batchTeacherCount }, (_, i) => `Faculty ${i + 1}`);
      }

      const subjects = [
        "Data Structures",
        "Operating Systems",
        "Database Management",
        "Computer Networks",
        "Artificial Intelligence",
        "Web Technologies",
      ];

      const batchPayload = namesList.map((entry, i) => {
        const parts = entry.split("-").map((p) => p.trim());
        const name = parts[0] || `Faculty ${i + 1}`;
        const subject = parts[1] || subjects[i % subjects.length];
        const num = maxCurrent + i + 1;
        const employeeId = `T-${num}`;
        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const email = `${sanitized || "faculty"}${num}@edumanage.com`;

        return {
          role: "TEACHER",
          name,
          email,
          employeeId,
          subject,
          password: batchTeacherPassword,
        };
      });

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchPayload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create batch teachers");
        return;
      }

      setSuccessMessage(`Successfully registered ${data.count} faculty members!`);
      setCreatedSummary(
        data.users.map((u: any) => ({
          name: u.name,
          identifier: u.employeeId,
          email: u.email,
          password: batchTeacherPassword,
          role: "TEACHER",
        }))
      );

      const addedTeachers: TeacherItem[] = data.users.map((u: any) => ({
        id: u.id,
        employeeId: u.employeeId,
        subject: u.subject,
        user: { name: u.name, email: u.email },
      }));
      setTeachers([...addedTeachers, ...teachers]);
      setBatchTeacherNamesText("");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during batch faculty creation.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCourseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const formattedName = `${courseForm.programLevel} - ${courseForm.courseTitle.trim()} (Year ${courseForm.year})`;

      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formattedName,
          gradeYear: Number(courseForm.year),
          teacherId: courseForm.teacherId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create degree course");
        return;
      }

      setSuccessMessage(`Degree Course "${data.name}" added successfully!`);
      setClassesList((prev) => [...prev, { id: data.id, name: data.name, gradeYear: data.gradeYear }]);
      router.refresh();
    } catch {
      setError("An unexpected error occurred while creating course.");
    } finally {
      setLoading(false);
    }
  }

  // Filtered lists
  const filteredStudents = students.filter(
    (s) =>
      s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.class?.name && s.class.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ marginTop: "2rem" }}>
      {/* Tab Switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.2rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className={activeTab === "STUDENTS" ? "" : "secondary"}
            onClick={() => {
              setActiveTab("STUDENTS");
              setError(null);
              setSuccessMessage(null);
            }}
          >
            🎓 Students ({students.length})
          </button>
          <button
            type="button"
            className={activeTab === "TEACHERS" ? "" : "secondary"}
            onClick={() => {
              setActiveTab("TEACHERS");
              setError(null);
              setSuccessMessage(null);
            }}
          >
            👨‍🏫 Faculty & Teachers ({teachers.length})
          </button>
          <button
            type="button"
            className={activeTab === "COURSES" ? "" : "secondary"}
            onClick={() => {
              setActiveTab("COURSES");
              setError(null);
              setSuccessMessage(null);
            }}
          >
            🏛️ Degree Courses ({classesList.length})
          </button>
        </div>

        {/* Sub-mode Selector for Students & Teachers */}
        {activeTab !== "COURSES" && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className={creationMode === "SINGLE" ? "" : "secondary"}
              style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem" }}
              onClick={() => setCreationMode("SINGLE")}
            >
              ➕ Add Single
            </button>
            <button
              type="button"
              className={creationMode === "BATCH" ? "" : "secondary"}
              style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem" }}
              onClick={() => setCreationMode("BATCH")}
            >
              ⚡ Quick Batch / Count
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div
          style={{
            background: "rgba(41, 165, 109, 0.12)",
            border: "1px solid rgba(41, 165, 109, 0.4)",
            borderRadius: "16px",
            padding: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontWeight: 700, color: "var(--green)", marginBottom: "0.4rem" }}>
            {successMessage}
          </div>
          {createdSummary.length > 0 && (
            <div style={{ marginTop: "0.8rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--ink)", marginBottom: "0.4rem" }}>
                <strong>New Credentials Ready to Sign In:</strong>
              </div>
              <div
                style={{
                  maxHeight: "180px",
                  overflowY: "auto",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "10px",
                  padding: "0.6rem 0.9rem",
                  fontSize: "0.82rem",
                  border: "1px solid var(--rule)",
                }}
              >
                {createdSummary.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.3rem 0",
                      borderBottom: idx < createdSummary.length - 1 ? "1px dashed var(--rule)" : "none",
                    }}
                  >
                    <span>
                      <strong>{item.name}</strong> ({item.identifier})
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                      Login: <code>{item.identifier}</code> or <code>{item.email}</code> | Pass: <code>{item.password}</code>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: "rgba(218, 90, 102, 0.12)",
            border: "1px solid rgba(218, 90, 102, 0.4)",
            color: "var(--red)",
            borderRadius: "16px",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENTS SECTION */}
      {/* ========================================================================= */}
      {activeTab === "STUDENTS" && (
        <>
          <div className="panel" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginTop: 0 }}>
              {creationMode === "SINGLE" ? "Enroll a Student in a Degree Course" : "Add Number of Students in Bulk"}
            </h3>

            {creationMode === "SINGLE" ? (
              <form onSubmit={handleSingleStudentSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div className="field">
                    <label>Student Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={studentForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
                        setStudentForm((prev) => ({
                          ...prev,
                          name,
                          email: prev.email ? prev.email : sanitized ? `${sanitized}@edumanage.com` : "",
                          admissionNo: prev.admissionNo ? prev.admissionNo : getSuggestedAdmissionNo(),
                        }));
                      }}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Admission No. (Student ID) *</label>
                    <input
                      type="text"
                      placeholder="e.g. S-2026-005"
                      value={studentForm.admissionNo}
                      onChange={(e) => setStudentForm({ ...studentForm, admissionNo: e.target.value })}
                      required
                    />
                    <small style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                      Students can log in with this ID or their email
                    </small>
                  </div>

                  <div className="field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. alex@edumanage.com"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Degree Course (UG / PG) *</label>
                    <select
                      value={studentForm.classId}
                      onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    >
                      <option value="">-- Unassigned --</option>
                      {ugClasses.length > 0 && (
                        <optgroup label="🎓 Undergraduate (UG) Degree Courses">
                          {ugClasses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {pgClasses.length > 0 && (
                        <optgroup label="🎯 Postgraduate (PG) Degree Courses">
                          {pgClasses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {otherClasses.length > 0 && (
                        <optgroup label="Other Degree Courses">
                          {otherClasses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="field">
                    <label>Initial Password</label>
                    <input
                      type="text"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Guardian / Parent Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Carlos Rivera"
                      value={studentForm.guardianName}
                      onChange={(e) => setStudentForm({ ...studentForm, guardianName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "1.2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={loading}>
                    {loading ? "Enrolling…" : "Enroll Student"}
                  </button>
                </div>
              </form>
            ) : (
              /* BATCH STUDENTS FORM */
              <form onSubmit={handleBatchStudentsSubmit}>
                <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 0 }}>
                  Quickly provision multiple student accounts with sequential admission numbers and login passwords.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div className="field">
                    <label>Number of Students to Add *</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={batchStudentCount}
                      onChange={(e) => setBatchStudentCount(parseInt(e.target.value, 10) || 1)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Admission No. Prefix</label>
                    <input
                      type="text"
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value)}
                      placeholder="e.g. S-2026"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Degree Course Assignment</label>
                    <select value={batchClassId} onChange={(e) => setBatchClassId(e.target.value)}>
                      <option value="">-- Unassigned --</option>
                      {ugClasses.length > 0 && (
                        <optgroup label="🎓 Undergraduate (UG) Degree Courses">
                          {ugClasses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {pgClasses.length > 0 && (
                        <optgroup label="🎯 Postgraduate (PG) Degree Courses">
                          {pgClasses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="field">
                    <label>Default Password</label>
                    <input
                      type="text"
                      value={batchPassword}
                      onChange={(e) => setBatchPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="field" style={{ marginBottom: "1rem" }}>
                  <label>
                    Student Names (Optional — 1 name per line. If left empty, names like "Student 2", "Student 3" will be generated):
                  </label>
                  <textarea
                    rows={4}
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: "0.9rem",
                      padding: "0.8rem",
                      borderRadius: "14px",
                      border: "1px solid var(--rule)",
                      background: "rgba(255, 255, 255, 0.8)",
                    }}
                    placeholder={`Maya Lin\nLeo Brooks\nSarah Connor\nDaniel Craig`}
                    value={batchNamesText}
                    onChange={(e) => setBatchNamesText(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={loading}>
                    {loading ? "Adding Students…" : `Create ${batchStudentCount} Students Now`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Enrolled Students Table */}
          <div className="panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ margin: 0 }}>All Enrolled Students ({students.length})</h3>
              <input
                type="text"
                placeholder="🔍 Search student name, admission no, or degree course…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: "340px", padding: "0.5rem 0.9rem", fontSize: "0.88rem" }}
              />
            </div>

            <table>
              <thead>
                <tr>
                  <th>Admission No.</th>
                  <th>Student Name</th>
                  <th>Degree Course</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <code>{s.admissionNo}</code>
                    </td>
                    <td>
                      <strong>{s.user.name}</strong>
                    </td>
                    <td>{s.class?.name || "Unassigned"}</td>
                    <td>{s.user.email}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                      No matching students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TEACHERS SECTION */}
      {/* ========================================================================= */}
      {activeTab === "TEACHERS" && (
        <>
          <div className="panel" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginTop: 0 }}>
              {creationMode === "SINGLE" ? "Add a Faculty Member / Teacher" : "Add Number of Teachers in Bulk"}
            </h3>

            {creationMode === "SINGLE" ? (
              <form onSubmit={handleSingleTeacherSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div className="field">
                    <label>Faculty Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Robert Vance"
                      value={teacherForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
                        setTeacherForm((prev) => ({
                          ...prev,
                          name,
                          email: prev.email ? prev.email : sanitized ? `${sanitized}@edumanage.com` : "",
                          employeeId: prev.employeeId ? prev.employeeId : getSuggestedEmployeeId(),
                        }));
                      }}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Employee ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. T-1002"
                      value={teacherForm.employeeId}
                      onChange={(e) => setTeacherForm({ ...teacherForm, employeeId: e.target.value })}
                      required
                    />
                    <small style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                      Faculty can sign in with this ID or their email
                    </small>
                  </div>

                  <div className="field">
                    <label>Subject Specialization *</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science, Artificial Intelligence"
                      value={teacherForm.subject}
                      onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. rvance@edumanage.com"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Initial Password</label>
                    <input
                      type="text"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "1.2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={loading}>
                    {loading ? "Adding Faculty…" : "Add Faculty Member"}
                  </button>
                </div>
              </form>
            ) : (
              /* BATCH TEACHERS FORM */
              <form onSubmit={handleBatchTeachersSubmit}>
                <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 0 }}>
                  Quickly provision multiple teacher staff accounts with sequential employee IDs and credentials.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div className="field">
                    <label>Number of Faculty to Add *</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={batchTeacherCount}
                      onChange={(e) => setBatchTeacherCount(parseInt(e.target.value, 10) || 1)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Default Password</label>
                    <input
                      type="text"
                      value={batchTeacherPassword}
                      onChange={(e) => setBatchTeacherPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="field" style={{ marginBottom: "1rem" }}>
                  <label>
                    Teacher Names & Subjects (Optional — format: <code>Name - Subject</code> per line):
                  </label>
                  <textarea
                    rows={4}
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: "0.9rem",
                      padding: "0.8rem",
                      borderRadius: "14px",
                      border: "1px solid var(--rule)",
                      background: "rgba(255, 255, 255, 0.8)",
                    }}
                    placeholder={`Dr. Alan Turing - Computer Science\nProf. Marie Curie - Physics\nDr. Ada Lovelace - Algorithms`}
                    value={batchTeacherNamesText}
                    onChange={(e) => setBatchTeacherNamesText(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={loading}>
                    {loading ? "Adding Faculty…" : `Create ${batchTeacherCount} Faculty Members Now`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Teachers Staff Table */}
          <div className="panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ margin: 0 }}>Teaching Staff ({teachers.length})</h3>
              <input
                type="text"
                placeholder="🔍 Search faculty name, ID, or subject…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: "340px", padding: "0.5rem 0.9rem", fontSize: "0.88rem" }}
              />
            </div>

            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Faculty Name</th>
                  <th>Subject</th>
                  <th>Assigned Courses</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <code>{t.employeeId}</code>
                    </td>
                    <td>
                      <strong>{t.user.name}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "rgba(47, 74, 199, 0.08)",
                          color: "var(--indigo)",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        {t.subject}
                      </span>
                    </td>
                    <td>
                      {t.classes && t.classes.length > 0
                        ? t.classes.map((c) => c.name).join(", ")
                        : "General Faculty"}
                    </td>
                    <td>{t.user.email}</td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                      No matching faculty found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* DEGREE COURSES SECTION (UG & PG) */}
      {/* ========================================================================= */}
      {activeTab === "COURSES" && (
        <>
          {/* Add Degree Course Form */}
          <div className="panel" style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginTop: 0 }}>Add New Degree Course</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 0 }}>
              Create an Undergraduate (UG) or Postgraduate (PG) degree program section for enrollment and faculty allocation.
            </p>

            <form onSubmit={handleAddCourseSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div className="field">
                  <label>Degree Level *</label>
                  <select
                    value={courseForm.programLevel}
                    onChange={(e) => setCourseForm({ ...courseForm, programLevel: e.target.value })}
                  >
                    <option value="UG">🎓 Undergraduate (UG)</option>
                    <option value="PG">🎯 Postgraduate (PG)</option>
                  </select>
                </div>

                <div className="field">
                  <label>Degree Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science, MCA, MBA..."
                    value={courseForm.courseTitle}
                    onChange={(e) => setCourseForm({ ...courseForm, courseTitle: e.target.value })}
                    required
                  />
                  <div style={{ marginTop: "0.3rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                    {["B.Tech CSE", "BCA", "B.Sc CS", "MCA", "MBA", "M.Tech CSE"].map((title) => (
                      <button
                        key={title}
                        type="button"
                        className="secondary"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.4rem", borderRadius: "6px" }}
                        onClick={() => setCourseForm((prev) => ({ ...prev, courseTitle: title }))}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>Year / Level *</label>
                  <select
                    value={courseForm.year}
                    onChange={(e) => setCourseForm({ ...courseForm, year: parseInt(e.target.value, 10) || 1 })}
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>

                <div className="field">
                  <label>Course Coordinator (Faculty)</label>
                  <select
                    value={courseForm.teacherId}
                    onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })}
                  >
                    <option value="">-- Select Faculty --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.user.name} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={loading}>
                  {loading ? "Adding Course…" : "➕ Create Degree Course"}
                </button>
              </div>
            </form>
          </div>

          {/* Dual Column: UG Courses & PG Courses */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* Undergraduate List */}
            <div className="panel">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.3rem" }}>🎓</span>
                <h3 style={{ margin: 0 }}>Undergraduate (UG) Courses ({ugClasses.length})</h3>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Year</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {ugClasses.map((c) => {
                    const studentCount = students.filter((s) => s.class?.name === c.name).length;
                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.name}</strong>
                        </td>
                        <td>Year {c.gradeYear}</td>
                        <td>
                          <span
                            style={{
                              background: studentCount > 0 ? "rgba(41, 165, 109, 0.12)" : "rgba(86, 101, 146, 0.1)",
                              color: studentCount > 0 ? "var(--green)" : "var(--muted)",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "999px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {studentCount} student{studentCount === 1 ? "" : "s"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {ugClasses.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "var(--muted)" }}>
                        No UG degree courses created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Postgraduate List */}
            <div className="panel">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.3rem" }}>🎯</span>
                <h3 style={{ margin: 0 }}>Postgraduate (PG) Courses ({pgClasses.length})</h3>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Year</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {pgClasses.map((c) => {
                    const studentCount = students.filter((s) => s.class?.name === c.name).length;
                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.name}</strong>
                        </td>
                        <td>Year {c.gradeYear}</td>
                        <td>
                          <span
                            style={{
                              background: studentCount > 0 ? "rgba(41, 165, 109, 0.12)" : "rgba(86, 101, 146, 0.1)",
                              color: studentCount > 0 ? "var(--green)" : "var(--muted)",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "999px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {studentCount} student{studentCount === 1 ? "" : "s"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {pgClasses.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "var(--muted)" }}>
                        No PG degree courses created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
