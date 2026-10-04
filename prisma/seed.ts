import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@edumanage.com" },
    update: {},
    create: {
      email: "admin@edumanage.com",
      passwordHash,
      role: Role.ADMIN,
      name: "System Administrator",
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@edumanage.com" },
    update: {},
    create: {
      email: "teacher@edumanage.com",
      passwordHash,
      role: Role.TEACHER,
      name: "Jane Teacher",
      teacher: {
        create: { employeeId: "T-1001", subject: "Mathematics" },
      },
    },
    include: { teacher: true },
  });

  const classSection = await prisma.classSection.upsert({
    where: { name_gradeYear: { name: "Grade 10 - A", gradeYear: 10 } },
    update: {},
    create: {
      name: "Grade 10 - A",
      gradeYear: 10,
      teacherId: teacherUser.teacher!.id,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@edumanage.com" },
    update: {},
    create: {
      email: "student@edumanage.com",
      passwordHash,
      role: Role.STUDENT,
      name: "Sam Student",
      student: {
        create: {
          admissionNo: "S-2026-001",
          classId: classSection.id,
        },
      },
    },
  });

  console.log("Seed complete:", { admin: admin.email, teacherUser: teacherUser.email, studentUser: studentUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
