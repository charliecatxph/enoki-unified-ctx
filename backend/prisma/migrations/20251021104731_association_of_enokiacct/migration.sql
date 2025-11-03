/*
  Warnings:

  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `EnokiAcct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId]` on the table `EnokiAcct` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EnokiAcct" ADD COLUMN     "studentId" TEXT,
ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "email",
DROP COLUMN "name";

-- CreateIndex
CREATE UNIQUE INDEX "EnokiAcct_studentId_key" ON "EnokiAcct"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "EnokiAcct_teacherId_key" ON "EnokiAcct"("teacherId");

-- AddForeignKey
ALTER TABLE "EnokiAcct" ADD CONSTRAINT "EnokiAcct_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnokiAcct" ADD CONSTRAINT "EnokiAcct_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
