/*
  Warnings:

  - You are about to drop the column `institutionId` on the `Teacher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Teacher" DROP CONSTRAINT "Teacher_institutionId_fkey";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "institutionId";
