/*
  Warnings:

  - A unique constraint covering the columns `[intraId]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `intraId` to the `Friend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friend" ADD COLUMN     "intraId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Friend_intraId_key" ON "Friend"("intraId");
