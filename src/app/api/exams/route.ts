import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hasRole } from "@/lib/auth";
import { z } from "zod";

const examSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  classId: z.string(),
  date: z.string(),
  maxMarks: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!hasRole(user, "TEACHER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = examSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: user!.userId } });
  if (!teacher) return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });

  const exam = await prisma.exam.create({
    data: { ...parsed.data, date: new Date(parsed.data.date), createdById: teacher.id },
  });
  return NextResponse.json(exam, { status: 201 });
}

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId") || undefined;

  const exams = await prisma.exam.findMany({
    where: { classId },
    include: { class: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(exams);
}
