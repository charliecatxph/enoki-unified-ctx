-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('MESSAGE', 'NOTIFY');

-- AlterTable
ALTER TABLE "CallTeacher" ADD COLUMN     "callType" "CallType" NOT NULL DEFAULT 'MESSAGE';
