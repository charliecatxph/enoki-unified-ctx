/*
  Warnings:

  - You are about to drop the column `timeIn` on the `GateScan` table. All the data in the column will be lost.
  - You are about to drop the column `timeOut` on the `GateScan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `GateScan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GateScan" DROP COLUMN "timeIn",
DROP COLUMN "timeOut",
DROP COLUMN "updatedAt",
ADD COLUMN     "in" TIMESTAMP(3),
ADD COLUMN     "out" TIMESTAMP(3);
