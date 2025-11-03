/*
  Warnings:

  - You are about to drop the column `notes` on the `TeacherStatistics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TeacherStatistics" DROP COLUMN "notes",
ADD COLUMN     "cmb" TIMESTAMP(3);
