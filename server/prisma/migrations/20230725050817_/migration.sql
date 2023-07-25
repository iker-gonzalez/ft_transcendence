-- CreateEnum
CREATE TYPE "GameBallColor" AS ENUM ('WHITE');

-- CreateTable
CREATE TABLE "GameBall" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "x" INTEGER NOT NULL DEFAULT 0,
    "y" INTEGER NOT NULL DEFAULT 0,
    "radius" INTEGER NOT NULL DEFAULT 0,
    "velocityX" INTEGER NOT NULL DEFAULT 0,
    "velocityY" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 0,
    "color" "GameBallColor" NOT NULL DEFAULT 'WHITE',
    "reset" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GameBall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameBall_id_key" ON "GameBall"("id");
