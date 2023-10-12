/*
  Warnings:

  - You are about to drop the `_GameDataSetToGameDataSetPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GameDataSetToGameDataSetPlayer" DROP CONSTRAINT "_GameDataSetToGameDataSetPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_GameDataSetToGameDataSetPlayer" DROP CONSTRAINT "_GameDataSetToGameDataSetPlayer_B_fkey";

-- AlterTable
ALTER TABLE "GameDataSetPlayer" ADD COLUMN     "gameDataSetId" TEXT;

-- DropTable
DROP TABLE "_GameDataSetToGameDataSetPlayer";

-- AddForeignKey
ALTER TABLE "GameDataSetPlayer" ADD CONSTRAINT "GameDataSetPlayer_gameDataSetId_fkey" FOREIGN KEY ("gameDataSetId") REFERENCES "GameDataSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
