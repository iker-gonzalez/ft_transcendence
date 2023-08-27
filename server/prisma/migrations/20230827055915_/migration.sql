/*
  Warnings:

  - You are about to drop the `GameData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "GameData";

-- CreateTable
CREATE TABLE "GameDataSet" (
    "id" TEXT NOT NULL,
    "gameDataId" TEXT NOT NULL,
    "gameData" TEXT NOT NULL,

    CONSTRAINT "GameDataSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameDataSet_id_key" ON "GameDataSet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GameDataSet_gameDataId_key" ON "GameDataSet"("gameDataId");
