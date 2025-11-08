/*
  Warnings:

  - A unique constraint covering the columns `[teacherId]` on the table `EnokiPhysicalLED` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EnokiPhysicalLED" ADD COLUMN     "teacherId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EnokiPhysicalLED_teacherId_key" ON "EnokiPhysicalLED"("teacherId");

-- AddForeignKey
ALTER TABLE "EnokiPhysicalLED" ADD CONSTRAINT "EnokiPhysicalLED_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
