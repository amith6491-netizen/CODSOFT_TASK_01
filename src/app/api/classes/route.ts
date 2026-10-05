import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hasRole } from "@/lib/auth";
import { z } from "zod";

const createClassSchema = z.object({
  name: z.string().min(1),
  gradeYear: z.number().int().min(1).max(12),
  teacherId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classes = await prisma.classSection.findMany({
    orderBy: [{ gradeYear: "asc" }, { name: "asc" }],
    include: {
      teacher: { include: { user: { select: { name: true, email: true } } } },
      _count: { select: { students: true } },
    },
  });

  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Only admins can create classes" }, { status: 403 });
  }

  const parsed = createClassSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const newClass = await prisma.classSection.create({
      data: {
        name: parsed.data.name.trim(),
        gradeYear: parsed.data.gradeYear,
        teacherId: parsed.data.teacherId || null,
      },
    });
    return NextResponse.json(newClass, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Class already exists or invalid data" }, { status: 400 });
  }
}
