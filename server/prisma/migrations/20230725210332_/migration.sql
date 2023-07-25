/*
  Warnings:

  - The primary key for the `GamePlayer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `GamePlayer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `index` to the `GamePlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GamePlayer" DROP CONSTRAINT "GamePlayer_pkey",
ADD COLUMN     "index" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GamePlayer_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_id_key" ON "GamePlayer"("id");
