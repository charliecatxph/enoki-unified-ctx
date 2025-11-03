-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."TStatus" AS ENUM ('IN_BUSY', 'IN_BREAK', 'IN_CLASS', 'OUT', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "public"."ACTType" AS ENUM ('OWNER', 'ADMIN', 'TEACHER', 'STUDENT');

-- CreateTable
CREATE TABLE "public"."Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "actType" "public"."ACTType" NOT NULL DEFAULT 'OWNER',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentRfidHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastCall" TIMESTAMP(3),
    "institutionId" TEXT NOT NULL,
    "courseId" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "employeeRfidHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherStatistics" (
    "id" TEXT NOT NULL,
    "status" "public"."TStatus" NOT NULL DEFAULT 'OUT',
    "notes" TEXT,
    "room" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GateScan" (
    "id" TEXT NOT NULL,
    "timeIn" TIMESTAMP(3),
    "timeOut" TIMESTAMP(3),
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GateScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CallTeacher" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "calledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "CallTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_email_key" ON "public"."Institution"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentRfidHash_key" ON "public"."Student"("studentRfidHash");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "public"."Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_employeeRfidHash_key" ON "public"."Teacher"("employeeRfidHash");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStatistics_teacherId_key" ON "public"."TeacherStatistics"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "GateScan_teacherId_key" ON "public"."GateScan"("teacherId");

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherStatistics" ADD CONSTRAINT "TeacherStatistics_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GateScan" ADD CONSTRAINT "GateScan_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CallTeacher" ADD CONSTRAINT "CallTeacher_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CallTeacher" ADD CONSTRAINT "CallTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

