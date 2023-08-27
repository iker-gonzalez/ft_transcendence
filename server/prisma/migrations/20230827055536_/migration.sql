-- CreateTable
CREATE TABLE "GameData" (
    "id" TEXT NOT NULL,
    "gameDataId" TEXT NOT NULL,
    "gameData" TEXT NOT NULL,

    CONSTRAINT "GameData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameData_id_key" ON "GameData"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GameData_gameDataId_key" ON "GameData"("gameDataId");
