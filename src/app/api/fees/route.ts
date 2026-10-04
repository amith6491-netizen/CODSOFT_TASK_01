import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hasRole } from "@/lib/auth";
import { z } from "zod";

const feeSchema = z.object({
  studentId: z.string(),
  term: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
});

// POST /api/fees - admin creates a fee record for a student
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = feeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const fee = await prisma.fee.create({
    data: { ...parsed.data, dueDate: new Date(parsed.data.dueDate) },
  });
  return NextResponse.json(fee, { status: 201 });
}

// GET /api/fees?studentId=...
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

  const fees = await prisma.fee.findMany({ where: { studentId }, orderBy: { dueDate: "asc" } });
  return NextResponse.json(fees);
}

// PATCH /api/fees - admin marks a fee as paid/waived
export async function PATCH(req: NextRequest) {
  const user = getAuthUser(req);
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status } = await req.json();
  const fee = await prisma.fee.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });
  return NextResponse.json(fee);
}
