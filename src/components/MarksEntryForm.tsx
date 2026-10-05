"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSubjectsForClassName } from "@/lib/curriculum";

export interface StudentInClass {
  id: string;
  name: string;
  admissionNo: string;
  classId?: string | null;
}

export interface ClassWithStudents {
  id: string;
  name: string;
  gradeYear: number;
  students: StudentInClass[];
}

export interface ExamRecord {
  id: string;
  title: string;
  subject: string;
  maxMarks: number;
  date: string;
  class: { name: string };
  grades: {
    id: string;
    studentId: string;
    marksObtained: number;
    remarks?: string | null;
    student: {
      admissionNo: string;
      user: { name: string };
    };
  }[];
}

export default function MarksEntryForm({
  classes,
  initialExams,
  defaultSubject = "Core Subject",
}: {
  classes: ClassWithStudents[];
  initialExams: ExamRecord[];
  defaultSubject?: string;
}) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"NEW_MARKS" | "HISTORY">("NEW_MARKS");

  // Selection state
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const initialClass = classes[0];
  const initialSubjects = initialClass ? getSubjectsForClassName(initialClass.name) : [];

  const [examTitle, setExamTitle] = useState("Semester Assessment 1");
  const [subjectName, setSubjectName] = useState(
    initialSubjects[0] || defaultSubject || "Core Subject"
  );
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [maxMarks, setMaxMarks] = useState(100);
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));

  // Marks map: studentId -> marksObtained
  const [marksMap, setMarksMap] = useState<Record<string, { marks: string; remarks: string }>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Exams history state
  const [exams, setExams] = useState<ExamRecord[]>(initialExams);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(initialExams[0]?.id || null);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const studentsInCurrentClass = currentClass?.students || [];
  const classSubjects = currentClass ? getSubjectsForClassName(currentClass.name) : [];

  function handleMarkChange(studentId: string, value: string) {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        marks: value,
        remarks: prev[studentId]?.remarks || "",
      },
    }));
  }

  function handleRemarkChange(studentId: string, value: string) {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        marks: prev[studentId]?.marks || "",
        remarks: value,
      },
    }));
  }

  async function handleSubmitMarks(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedClassId) {
      setError("Please select a degree course / class.");
      return;
    }
    if (!subjectName.trim()) {
      setError("Please enter a subject name.");
      return;
    }

    // Collect valid student marks
    const gradesToSubmit: { studentId: string; marksObtained: number; remarks?: string }[] = [];
    for (const s of studentsInCurrentClass) {
      const entry = marksMap[s.id];
      if (entry && entry.marks !== "") {
        const num = parseFloat(entry.marks);
        if (isNaN(num) || num < 0 || num > maxMarks) {
          setError(`Invalid marks for ${s.name}: must be between 0 and ${maxMarks}`);
          return;
        }
        gradesToSubmit.push({
          studentId: s.id,
          marksObtained: num,
          remarks: entry.remarks.trim() || undefined,
        });
      }
    }

    if (gradesToSubmit.length === 0) {
      setError("Please enter marks for at least one student.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create the exam
      const examRes = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: examTitle.trim(),
          subject: subjectName.trim(),
          classId: selectedClassId,
          date: examDate,
          maxMarks: Number(maxMarks),
        }),
      });

      const examData = await examRes.json();
      if (!examRes.ok) {
        setError(examData.error || "Failed to create assessment");
        return;
      }

      // 2. Submit the grades
      const gradeRes = await fetch("/api/exams/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: examData.id,
          grades: gradesToSubmit,
        }),
      });

      const gradeData = await gradeRes.json();
      if (!gradeRes.ok) {
        setError(gradeData.error || "Failed to save marks");
        return;
      }

      setSuccess(
        `Successfully saved marks for ${gradesToSubmit.length} student(s) in ${examTitle} (${subjectName})!`
      );

      // Add to local exams history
      const newExamRecord: ExamRecord = {
        id: examData.id,
        title: examData.title,
        subject: examData.subject,
        maxMarks: examData.maxMarks,
        date: examData.date,
        class: { name: currentClass.name },
        grades: gradesToSubmit.map((g) => {
          const st = studentsInCurrentClass.find((x) => x.id === g.studentId);
          return {
            id: `${examData.id}-${g.studentId}`,
            studentId: g.studentId,
            marksObtained: g.marksObtained,
            remarks: g.remarks,
            student: {
              admissionNo: st?.admissionNo || "",
              user: { name: st?.name || "Student" },
            },
          };
        }),
      };

      setExams([newExamRecord, ...exams]);
      setExpandedExamId(newExamRecord.id);

      // Reset form
      setMarksMap({});
      router.refresh();
    } catch {
      setError("An unexpected error occurred while saving marks.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {/* Switcher */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.2rem" }}>
        <button
          type="button"
          className={activeView === "NEW_MARKS" ? "" : "secondary"}
          onClick={() => {
            setActiveView("NEW_MARKS");
            setError(null);
            setSuccess(null);
          }}
        >
          📝 Enter Student Marks
        </button>
        <button
          type="button"
          className={activeView === "HISTORY" ? "" : "secondary"}
          onClick={() => {
            setActiveView("HISTORY");
            setError(null);
            setSuccess(null);
          }}
        >
          📊 Recorded Marks History ({exams.length})
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div
          style={{
            background: "rgba(41, 165, 109, 0.12)",
            border: "1px solid rgba(41, 165, 109, 0.4)",
            color: "var(--green)",
            borderRadius: "16px",
            padding: "1rem 1.2rem",
            marginBottom: "1.2rem",
            fontWeight: 600,
          }}
        >
          🎉 {success}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div
          style={{
            background: "rgba(218, 90, 102, 0.12)",
            border: "1px solid rgba(218, 90, 102, 0.4)",
            color: "var(--red)",
            borderRadius: "16px",
            padding: "1rem 1.2rem",
            marginBottom: "1.2rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW MARKS ENTRY FORM */}
      {/* ========================================================================= */}
      {activeView === "NEW_MARKS" && (
        <form onSubmit={handleSubmitMarks}>
          <div className="panel" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginTop: 0 }}>Assessment / Exam Details</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="field">
                <label>Select Degree Course / Class *</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedClassId(newId);
                    setMarksMap({});
                    const targetClass = classes.find((c) => c.id === newId);
                    if (targetClass) {
                      const subjects = getSubjectsForClassName(targetClass.name);
                      if (subjects.length > 0) {
                        setSubjectName(subjects[0]);
                        setIsCustomSubject(false);
                      }
                    }
                  }}
                  required
                >
                  <optgroup label="🎓 Undergraduate (UG) Degree Courses">
                    {classes
                      .filter((c) => c.name.startsWith("UG") || !c.name.startsWith("PG"))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.students.length} students)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🎓 Postgraduate (PG) Degree Courses">
                    {classes
                      .filter((c) => c.name.startsWith("PG"))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.students.length} students)
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div className="field">
                <label>
                  Subject Name * {classSubjects.length > 0 ? `(${classSubjects.length} subjects in curriculum)` : ""}
                </label>
                {classSubjects.length > 0 ? (
                  <>
                    <select
                      value={isCustomSubject ? "__custom__" : subjectName}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomSubject(true);
                          setSubjectName("");
                        } else {
                          setIsCustomSubject(false);
                          setSubjectName(e.target.value);
                        }
                      }}
                      required
                    >
                      <option value="" disabled>-- Select Official Subject from Curriculum --</option>
                      {classSubjects.map((s) => (
                        <option key={s} value={s}>
                          📖 {s}
                        </option>
                      ))}
                      <option value="__custom__">✏️ Custom / Elective Subject (Type below)</option>
                    </select>

                    {(isCustomSubject || !classSubjects.includes(subjectName)) && (
                      <input
                        type="text"
                        placeholder="Type custom subject name..."
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        style={{ marginTop: "0.5rem" }}
                        required
                      />
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter subject name"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="field">
                <label>Assessment / Exam Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Term 1, Final Exam, Quiz 1"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Maximum Marks *</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(parseInt(e.target.value, 10) || 100)}
                  required
                />
              </div>

              <div className="field">
                <label>Date of Assessment</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Student Roster Table for Marks */}
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
              <div>
                <h3 style={{ margin: "0 0 0.2rem" }}>
                  Student Marks Roster — {currentClass?.name || "Selected Course"}
                </h3>
                <small style={{ color: "var(--muted)" }}>
                  Enter marks obtained (out of {maxMarks}) for each enrolled student
                </small>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                  onClick={() => {
                    const filled: Record<string, { marks: string; remarks: string }> = {};
                    studentsInCurrentClass.forEach((s) => {
                      filled[s.id] = { marks: String(Math.round(maxMarks * 0.8)), remarks: "Satisfactory" };
                    });
                    setMarksMap(filled);
                  }}
                >
                  ⚡ Auto-fill 80%
                </button>
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                  onClick={() => setMarksMap({})}
                >
                  🧹 Clear Inputs
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ width: "140px" }}>Admission No.</th>
                  <th>Student Name</th>
                  <th style={{ width: "160px" }}>Marks Obtained (/{maxMarks})</th>
                  <th style={{ width: "100px" }}>Percentage</th>
                  <th>Teacher Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody>
                {studentsInCurrentClass.map((student) => {
                  const currentMarkStr = marksMap[student.id]?.marks ?? "";
                  const currentMarkNum = parseFloat(currentMarkStr);
                  const percentage =
                    !isNaN(currentMarkNum) && maxMarks > 0
                      ? Math.round((currentMarkNum / maxMarks) * 100)
                      : null;

                  return (
                    <tr key={student.id}>
                      <td>
                        <code>{student.admissionNo}</code>
                      </td>
                      <td>
                        <strong>{student.name}</strong>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={maxMarks}
                          step="0.5"
                          placeholder="e.g. 85"
                          value={currentMarkStr}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          style={{
                            padding: "0.45rem 0.7rem",
                            fontSize: "0.92rem",
                            fontWeight: 600,
                            maxWidth: "130px",
                          }}
                        />
                      </td>
                      <td>
                        {percentage !== null ? (
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                percentage >= 75
                                  ? "var(--green)"
                                  : percentage >= 40
                                  ? "var(--amber)"
                                  : "var(--red)",
                            }}
                          >
                            {percentage}%
                          </span>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g. Well done, Keep practicing..."
                          value={marksMap[student.id]?.remarks ?? ""}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          style={{
                            padding: "0.45rem 0.7rem",
                            fontSize: "0.88rem",
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}

                {studentsInCurrentClass.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "2.5rem" }}>
                      No students are currently enrolled in this degree course.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {studentsInCurrentClass.length > 0 && (
              <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={loading} style={{ minWidth: "220px" }}>
                  {loading ? "Saving Marks…" : "💾 Save & Publish Marks"}
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* RECORDED MARKS HISTORY */}
      {/* ========================================================================= */}
      {activeView === "HISTORY" && (
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Recorded Assessments & Grades</h3>

          {exams.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No assessments recorded yet. Use the "Enter Student Marks" tab to record marks.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {exams.map((ex) => {
                const isExpanded = expandedExamId === ex.id;
                const gradesCount = ex.grades.length;
                const avgMarks =
                  gradesCount > 0
                    ? Math.round(
                        (ex.grades.reduce((acc, g) => acc + g.marksObtained, 0) / gradesCount) * 10
                      ) / 10
                    : null;
                const highestMarks =
                  gradesCount > 0
                    ? Math.max(...ex.grades.map((g) => g.marksObtained))
                    : null;

                return (
                  <div
                    key={ex.id}
                    style={{
                      border: "1px solid var(--rule)",
                      borderRadius: "16px",
                      background: "rgba(255, 255, 255, 0.8)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => setExpandedExamId(isExpanded ? null : ex.id)}
                      style={{
                        padding: "1rem 1.2rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none",
                        background: isExpanded ? "rgba(47, 74, 199, 0.05)" : "transparent",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <strong>{ex.title}</strong>
                          <span
                            style={{
                              background: "rgba(47, 74, 199, 0.1)",
                              color: "var(--indigo)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {ex.subject}
                          </span>
                          <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                            • {ex.class.name}
                          </span>
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
                          Date: {new Date(ex.date).toISOString().slice(0, 10)} | Max Marks: {ex.maxMarks}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {avgMarks !== null && (
                          <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
                            <span style={{ color: "var(--muted)" }}>Avg: </span>
                            <strong>{avgMarks}</strong> / {ex.maxMarks}
                            <span style={{ color: "var(--muted)", marginLeft: "0.6rem" }}>Highest: </span>
                            <strong style={{ color: "var(--green)" }}>{highestMarks}</strong>
                          </div>
                        )}
                        <span style={{ fontSize: "1rem", color: "var(--muted)" }}>
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "0 1.2rem 1.2rem 1.2rem" }}>
                        <table>
                          <thead>
                            <tr>
                              <th>Admission No.</th>
                              <th>Student Name</th>
                              <th>Marks Obtained</th>
                              <th>Percentage</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ex.grades.map((g) => {
                              const pct = Math.round((g.marksObtained / ex.maxMarks) * 100);
                              return (
                                <tr key={g.id}>
                                  <td>
                                    <code>{g.student.admissionNo}</code>
                                  </td>
                                  <td>
                                    <strong>{g.student.user.name}</strong>
                                  </td>
                                  <td>
                                    <strong>{g.marksObtained}</strong> / {ex.maxMarks}
                                  </td>
                                  <td>
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        color:
                                          pct >= 75
                                            ? "var(--green)"
                                            : pct >= 40
                                            ? "var(--amber)"
                                            : "var(--red)",
                                      }}
                                    >
                                      {pct}%
                                    </span>
                                  </td>
                                  <td style={{ color: "var(--muted)" }}>
                                    {g.remarks || "—"}
                                  </td>
                                </tr>
                              );
                            })}
                            {ex.grades.length === 0 && (
                              <tr>
                                <td colSpan={5} style={{ color: "var(--muted)", textAlign: "center" }}>
                                  No grades recorded for this assessment.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
