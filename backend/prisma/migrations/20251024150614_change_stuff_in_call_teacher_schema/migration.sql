/*
  Warnings:

  - Added the required column `message` to the `CallTeacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CallTeacher" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
