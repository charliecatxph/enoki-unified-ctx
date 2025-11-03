/*
  Warnings:

  - Made the column `institutionId` on table `EnokiAcct` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."EnokiAcct" DROP CONSTRAINT "EnokiAcct_institutionId_fkey";

-- AlterTable
ALTER TABLE "public"."EnokiAcct" ALTER COLUMN "institutionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."EnokiAcct" ADD CONSTRAINT "EnokiAcct_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
