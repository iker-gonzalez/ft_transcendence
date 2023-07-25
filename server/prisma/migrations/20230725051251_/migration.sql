/*
  Warnings:

  - Added the required column `gameBallId` to the `GameSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "gameBallId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_gameBallId_fkey" FOREIGN KEY ("gameBallId") REFERENCES "GameBall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
