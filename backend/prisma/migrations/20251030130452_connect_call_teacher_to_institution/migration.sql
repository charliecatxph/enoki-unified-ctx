-- AlterTable
ALTER TABLE "CallTeacher" ADD COLUMN     "institutionId" TEXT NOT NULL DEFAULT '898b4819-1877-41b4-aae4-d16f571ddb3b';

-- AddForeignKey
ALTER TABLE "CallTeacher" ADD CONSTRAINT "CallTeacher_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
