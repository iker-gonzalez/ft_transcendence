/*
  Warnings:

  - You are about to drop the column `gameBallId` on the `GameSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameSessionId]` on the table `GameBall` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameSessionId` to the `GameBall` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GameSession" DROP CONSTRAINT "GameSession_gameBallId_fkey";

-- AlterTable
ALTER TABLE "GameBall" ADD COLUMN     "gameSessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameSession" DROP COLUMN "gameBallId";

-- CreateIndex
CREATE UNIQUE INDEX "GameBall_gameSessionId_key" ON "GameBall"("gameSessionId");

-- AddForeignKey
ALTER TABLE "GameBall" ADD CONSTRAINT "GameBall_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
