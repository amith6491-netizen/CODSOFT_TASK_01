import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getAuthUser, hasRole } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  // Optional role-specific fields
  employeeId: z.string().optional(),
  subject: z.string().optional(),
  admissionNo: z.string().optional(),
  classId: z.string().optional(),
});

/**
 * Only an existing admin can create new accounts.
 * The very first admin should be created directly via the seed script.
 */
export async function POST(req: NextRequest) {
  const requester = getAuthUser(req);
  if (!hasRole(requester, "ADMIN")) {
    return NextResponse.json({ error: "Only admins can create accounts" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      ...(data.role === "TEACHER" && {
        teacher: { create: { employeeId: data.employeeId!, subject: data.subject! } },
      }),
      ...(data.role === "STUDENT" && {
        student: { create: { admissionNo: data.admissionNo!, classId: data.classId } },
      }),
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
}
