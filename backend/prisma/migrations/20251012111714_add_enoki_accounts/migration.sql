-- AlterEnum
ALTER TYPE "public"."ACTType" ADD VALUE 'KIOSK';

-- CreateTable
CREATE TABLE "public"."EnokiAcct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."ACTType",
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnokiAcct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnokiAcct_email_key" ON "public"."EnokiAcct"("email");

-- AddForeignKey
ALTER TABLE "public"."EnokiAcct" ADD CONSTRAINT "EnokiAcct_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
