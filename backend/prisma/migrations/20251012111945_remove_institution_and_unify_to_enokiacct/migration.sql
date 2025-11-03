/*
  Warnings:

  - You are about to drop the column `role` on the `EnokiAcct` table. All the data in the column will be lost.
  - You are about to drop the column `actType` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `ownerName` on the `Institution` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Institution` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Institution_email_key";

-- AlterTable
ALTER TABLE "public"."EnokiAcct" DROP COLUMN "role",
ADD COLUMN     "actType" "public"."ACTType";

-- AlterTable
ALTER TABLE "public"."Institution" DROP COLUMN "actType",
DROP COLUMN "email",
DROP COLUMN "ownerName",
DROP COLUMN "password";
