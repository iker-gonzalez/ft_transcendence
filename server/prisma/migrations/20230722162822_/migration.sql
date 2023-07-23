-- DropForeignKey
ALTER TABLE "GameSessionPlayer" DROP CONSTRAINT "GameSessionPlayer_gameSessionId_fkey";

-- AddForeignKey
ALTER TABLE "GameSessionPlayer" ADD CONSTRAINT "GameSessionPlayer_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
