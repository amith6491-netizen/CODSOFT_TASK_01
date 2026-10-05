import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getAuthUser, hasRole } from "@/lib/auth";
import { z } from "zod";

const singleSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  employeeId: z.string().optional(),
  subject: z.string().optional(),
  admissionNo: z.string().optional(),
  classId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianPhone: z.string().optional().nullable(),
});

const batchSchema = z.object({
  batch: z.array(singleSchema).min(1),
});

async function createAccount(data: z.infer<typeof singleSchema>) {
  // Check email
  const existingEmail = await prisma.user.findFirst({
    where: { email: { equals: data.email, mode: "insensitive" } },
  });
  if (existingEmail) {
    throw new Error(`Email "${data.email}" is already registered`);
  }

  // Check admission number
  if (data.role === "STUDENT") {
    if (!data.admissionNo) {
      throw new Error(`Admission number is required for student "${data.name}"`);
    }
    const existingAdmission = await prisma.student.findFirst({
      where: { admissionNo: { equals: data.admissionNo, mode: "insensitive" } },
    });
    if (existingAdmission) {
      throw new Error(`Admission number "${data.admissionNo}" is already taken`);
    }
  }

  // Check employee ID
  if (data.role === "TEACHER") {
    if (!data.employeeId) {
      throw new Error(`Employee ID is required for teacher "${data.name}"`);
    }
    const existingEmployee = await prisma.teacher.findFirst({
      where: { employeeId: { equals: data.employeeId, mode: "insensitive" } },
    });
    if (existingEmployee) {
      throw new Error(`Employee ID "${data.employeeId}" is already taken`);
    }
  }

  const passwordHash = await hashPassword(data.password);
  const cleanClassId = data.classId && data.classId.trim() !== "" ? data.classId : null;

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash,
      name: data.name.trim(),
      role: data.role,
      ...(data.role === "TEACHER" && {
        teacher: {
          create: {
            employeeId: data.employeeId!.trim(),
            subject: data.subject?.trim() || "General",
            phone: data.phone?.trim() || null,
          },
        },
      }),
      ...(data.role === "STUDENT" && {
        student: {
          create: {
            admissionNo: data.admissionNo!.trim(),
            classId: cleanClassId,
            guardianName: data.guardianName?.trim() || null,
            guardianPhone: data.guardianPhone?.trim() || null,
          },
        },
      }),
    },
    include: {
      student: { include: { class: true } },
      teacher: true,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    admissionNo: user.student?.admissionNo,
    className: user.student?.class?.name,
    employeeId: user.teacher?.employeeId,
    subject: user.teacher?.subject,
  };
}

export async function POST(req: NextRequest) {
  const requester = getAuthUser(req);
  if (!hasRole(requester, "ADMIN")) {
    return NextResponse.json({ error: "Only admins can create accounts" }, { status: 403 });
  }

  try {
    const raw = await req.json();

    // Check if batch
    if (raw && Array.isArray(raw.batch)) {
      const parsedBatch = batchSchema.safeParse(raw);
      if (!parsedBatch.success) {
        return NextResponse.json({ error: parsedBatch.error.flatten() }, { status: 400 });
      }

      const results = [];
      for (const item of parsedBatch.data.batch) {
        results.push(await createAccount(item));
      }
      return NextResponse.json({ count: results.length, users: results }, { status: 201 });
    }

    // Single item
    const parsedSingle = singleSchema.safeParse(raw);
    if (!parsedSingle.success) {
      return NextResponse.json({ error: parsedSingle.error.flatten() }, { status: 400 });
    }

    const created = await createAccount(parsedSingle.data);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 400 });
  }
}

