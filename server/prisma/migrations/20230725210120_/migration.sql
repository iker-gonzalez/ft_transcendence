/*
  Warnings:

  - The primary key for the `GamePlayer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `GamePlayer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "GamePlayer" DROP CONSTRAINT "GamePlayer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_id_key" ON "GamePlayer"("id");
