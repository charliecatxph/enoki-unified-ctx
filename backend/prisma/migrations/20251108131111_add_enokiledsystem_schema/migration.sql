-- CreateTable
CREATE TABLE "EnokiLEDSystem" (
    "deviceSID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "institutionId" TEXT NOT NULL,
    "ledArray" JSONB NOT NULL,
    "currentState" INTEGER NOT NULL,

    CONSTRAINT "EnokiLEDSystem_pkey" PRIMARY KEY ("deviceSID")
);

-- CreateTable
CREATE TABLE "EnokiPhysicalLED" (
    "ledUq" TEXT NOT NULL,
    "enokiLEDSystemId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,

    CONSTRAINT "EnokiPhysicalLED_pkey" PRIMARY KEY ("ledUq")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnokiLEDSystem_institutionId_key" ON "EnokiLEDSystem"("institutionId");

-- AddForeignKey
ALTER TABLE "EnokiLEDSystem" ADD CONSTRAINT "EnokiLEDSystem_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnokiPhysicalLED" ADD CONSTRAINT "EnokiPhysicalLED_enokiLEDSystemId_fkey" FOREIGN KEY ("enokiLEDSystemId") REFERENCES "EnokiLEDSystem"("deviceSID") ON DELETE RESTRICT ON UPDATE CASCADE;
