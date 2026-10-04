import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hasRole } from "@/lib/auth";
import { z } from "zod";

const markSchema = z.object({
  studentId: z.string(),
  date: z.string(), // ISO date
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
});

// POST /api/attendance - teacher marks attendance for one student
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!hasRole(user, "TEACHER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = markSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: user!.userId } });
  if (!teacher) return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });

  const { studentId, date, status } = parsed.data;
  const record = await prisma.attendance.upsert({
    where: { studentId_date: { studentId, date: new Date(date) } },
    update: { status, takenById: teacher.id },
    create: { studentId, date: new Date(date), status, takenById: teacher.id },
  });

  return NextResponse.json(record);
}

// GET /api/attendance?studentId=...&from=...&to=...
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

  const records = await prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}
