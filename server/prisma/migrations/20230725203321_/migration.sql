/*
  Warnings:

  - You are about to drop the column `createdAt` on the `GameBall` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `GameBall` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameBall" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL DEFAULT 0,
    "y" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "color" "GameBallColor" NOT NULL DEFAULT 'WHITE',

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_id_key" ON "GamePlayer"("id");
