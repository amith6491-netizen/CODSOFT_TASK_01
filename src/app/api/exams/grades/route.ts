import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hasRole } from "@/lib/auth";
import { z } from "zod";

const gradeSchema = z.object({
  examId: z.string(),
  studentId: z.string(),
  marksObtained: z.number().nonnegative(),
  remarks: z.string().optional(),
});

// POST /api/exams/grades - teacher records a grade
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!hasRole(user, "TEACHER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = gradeSchema.safeParse(await req.json());
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
