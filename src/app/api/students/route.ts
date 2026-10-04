import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hasRole } from "@/lib/auth";

// GET /api/students - list students (admin/teacher only)
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!hasRole(user, "ADMIN", "TEACHER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const students = await prisma.student.findMany({
    include: { user: { select: { name: true, email: true } }, class: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(students);
}
