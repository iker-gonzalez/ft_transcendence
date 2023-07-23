/*
  Warnings:

  - You are about to drop the `GameSessionPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameSessionPlayer" DROP CONSTRAINT "GameSessionPlayer_gameSessionId_fkey";

-- DropForeignKey
ALTER TABLE "GameSessionPlayer" DROP CONSTRAINT "GameSessionPlayer_userId_fkey";

-- DropTable
DROP TABLE "GameSessionPlayer";
