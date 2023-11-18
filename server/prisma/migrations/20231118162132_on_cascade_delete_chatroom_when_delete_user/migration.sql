/*
  Warnings:

  - You are about to drop the column `admins` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `bans` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `mute` on the `ChatRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "admins",
DROP COLUMN "bans",
DROP COLUMN "mute";

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
