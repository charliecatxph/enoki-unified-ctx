/*
  Warnings:

  - You are about to drop the column `email` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Teacher` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Teacher_email_key";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "password";
