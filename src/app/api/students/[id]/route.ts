import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hasRole } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Students may only view their own record; admins/teachers can view any.
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      class: true,
      attendance: { orderBy: { date: "desc" }, take: 30 },
      grades: { include: { exam: true } },
      fees: true,
    },
  });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "STUDENT" && student.userId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json();
  const student = await prisma.student.update({
    where: { id },
    data: {
      guardianName: body.guardianName,
      guardianPhone: body.guardianPhone,
      classId: body.classId,
    },
  });
  return NextResponse.json(student);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
