/*
  Warnings:

  - You are about to drop the column `institutionId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_institutionId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "institutionId";
