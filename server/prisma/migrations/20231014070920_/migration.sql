/*
  Warnings:

  - You are about to drop the `GameBall` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GamePlayer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameBall" DROP CONSTRAINT "GameBall_gameSessionId_fkey";

-- DropForeignKey
ALTER TABLE "GameDataSetPlayer" DROP CONSTRAINT "GameDataSetPlayer_gameDataSetId_fkey";

-- DropForeignKey
ALTER TABLE "GamePlayer" DROP CONSTRAINT "GamePlayer_gameSessionId_fkey";

-- DropForeignKey
ALTER TABLE "UserIntraData" DROP CONSTRAINT "UserIntraData_userGameSessionId_fkey";

-- DropTable
DROP TABLE "GameBall";

-- DropTable
DROP TABLE "GamePlayer";

-- DropTable
DROP TABLE "GameSession";

-- DropEnum
DROP TYPE "GameBallColor";

-- AddForeignKey
ALTER TABLE "UserIntraData" ADD CONSTRAINT "UserIntraData_userGameSessionId_fkey" FOREIGN KEY ("userGameSessionId") REFERENCES "UserGameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDataSetPlayer" ADD CONSTRAINT "GameDataSetPlayer_gameDataSetId_fkey" FOREIGN KEY ("gameDataSetId") REFERENCES "GameDataSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
