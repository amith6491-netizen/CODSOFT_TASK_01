import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hasRole } from "@/lib/auth";
import { z } from "zod";

const singleGradeSchema = z.object({
  examId: z.string(),
  studentId: z.string(),
  marksObtained: z.number().nonnegative(),
  remarks: z.string().optional(),
});

const batchGradeSchema = z.object({
  examId: z.string(),
  grades: z
    .array(
      z.object({
        studentId: z.string(),
        marksObtained: z.number().nonnegative(),
        remarks: z.string().optional(),
      })
    )
    .min(1),
});

// POST /api/exams/grades - teacher records a grade or batch grades
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!hasRole(user, "TEACHER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = await req.json();

  // Check if batch submission
  if (raw && Array.isArray(raw.grades)) {
    const parsedBatch = batchGradeSchema.safeParse(raw);
    if (!parsedBatch.success) {
      return NextResponse.json({ error: parsedBatch.error.flatten() }, { status: 400 });
    }

    const { examId, grades } = parsedBatch.data;
    const upserted = await Promise.all(
      grades.map((g) =>
        prisma.grade.upsert({
          where: { examId_studentId: { examId, studentId: g.studentId } },
          update: { marksObtained: g.marksObtained, remarks: g.remarks || null },
          create: { examId, studentId: g.studentId, marksObtained: g.marksObtained, remarks: g.remarks || null },
        })
      )
    );

    return NextResponse.json({ count: upserted.length, grades: upserted });
  }

  // Single grade submission
  const parsed = singleGradeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { examId, studentId, marksObtained, remarks } = parsed.data;

  const grade = await prisma.grade.upsert({
    where: { examId_studentId: { examId, studentId } },
    update: { marksObtained, remarks },
    create: { examId, studentId, marksObtained, remarks },
  });
  return NextResponse.json(grade);
}

// GET /api/exams/grades?studentId=...
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student || student.id !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const grades = await prisma.grade.findMany({
    where: { studentId },
    include: { exam: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(grades);
}
