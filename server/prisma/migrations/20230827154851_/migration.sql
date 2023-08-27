/*
  Warnings:

  - You are about to drop the column `player1Ready` on the `GameDataSet` table. All the data in the column will be lost.
  - You are about to drop the column `player2Ready` on the `GameDataSet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameDataSet" DROP COLUMN "player1Ready",
DROP COLUMN "player2Ready",
ADD COLUMN     "user1Ready" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user2Ready" BOOLEAN NOT NULL DEFAULT false;
