/*
  Warnings:

  - The `cmb` column on the `TeacherStatistics` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TeacherStatistics" DROP COLUMN "cmb",
ADD COLUMN     "cmb" INTEGER;
