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
    where: { name_gradeYear: { name: "UG - B.Tech CSE (Year 1)", gradeYear: 1 } },
    update: {},
    create: {
      name: "UG - B.Tech CSE (Year 1)",
      gradeYear: 1,
      teacherId: teacherUser.teacher!.id,
    },
  });

  const additionalCourses = [
    { name: "UG - B.Tech CSE (Year 2)", gradeYear: 2 },
    { name: "UG - B.Tech CSE (Year 3)", gradeYear: 3 },
    { name: "UG - B.Tech CSE (Year 4)", gradeYear: 4 },
    { name: "UG - BCA (Year 1)", gradeYear: 1 },
    { name: "UG - BCA (Year 2)", gradeYear: 2 },
    { name: "UG - BCA (Year 3)", gradeYear: 3 },
    { name: "UG - B.Sc Data Science (Year 1)", gradeYear: 1 },
    { name: "UG - B.Com (Hons) (Year 1)", gradeYear: 1 },
    { name: "UG - BBA (Year 1)", gradeYear: 1 },
    { name: "PG - MCA (Year 1)", gradeYear: 1 },
    { name: "PG - MCA (Year 2)", gradeYear: 2 },
    { name: "PG - MBA (Year 1)", gradeYear: 1 },
    { name: "PG - MBA (Year 2)", gradeYear: 2 },
    { name: "PG - M.Tech CSE (Year 1)", gradeYear: 1 },
    { name: "PG - M.Sc Computer Science (Year 1)", gradeYear: 1 },
  ];

  for (const course of additionalCourses) {
    await prisma.classSection.upsert({
      where: { name_gradeYear: { name: course.name, gradeYear: course.gradeYear } },
      update: {},
      create: {
        name: course.name,
        gradeYear: course.gradeYear,
        teacherId: teacherUser.teacher!.id,
      },
    });
  }

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
