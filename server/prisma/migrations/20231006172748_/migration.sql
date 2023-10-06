/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Friend` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Friend_intraId_key";

-- AlterTable
ALTER TABLE "Friend" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Friend_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_id_key" ON "Friend"("id");
