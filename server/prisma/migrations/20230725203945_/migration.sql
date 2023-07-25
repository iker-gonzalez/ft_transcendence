/*
  Warnings:

  - You are about to drop the `GameSessionPlayer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[gameSessionId]` on the table `GamePlayer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameSessionId` to the `GamePlayer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GameSessionPlayer" DROP CONSTRAINT "GameSessionPlayer_gameSessionId_fkey";

-- AlterTable
ALTER TABLE "GamePlayer" ADD COLUMN     "gameSessionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "GameSessionPlayer";

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_gameSessionId_key" ON "GamePlayer"("gameSessionId");

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
