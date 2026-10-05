import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const schema = z
  .object({
    identifier: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    password: z.string().min(1),
  })
  .refine((data) => Boolean(data.identifier || data.email), {
    message: "Email or admission number is required",
  });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
  }

  const rawIdentifier = (parsed.data.identifier || parsed.data.email || "").trim();
  const { password } = parsed.data;

  // 1. Try finding user directly by email
  let user = await prisma.user.findFirst({
    where: {
      email: {
        equals: rawIdentifier,
        mode: "insensitive",
      },
    },
  });

  // 2. If not found by email, try student admission number
  if (!user) {
    const student = await prisma.student.findFirst({
      where: {
        admissionNo: {
          equals: rawIdentifier,
          mode: "insensitive",
        },
      },
      include: { user: true },
    });
    if (student) {
      user = student.user;
    }
  }

  // 3. If still not found, check teacher employee ID
  if (!user) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        employeeId: {
          equals: rawIdentifier,
          mode: "insensitive",
        },
      },
      include: { user: true },
    });
    if (teacher) {
      user = teacher.user;
    }
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set("edumanage_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

