/*
  Warnings:

  - You are about to drop the column `admins` on the `ChatRoomUser` table. All the data in the column will be lost.
  - You are about to drop the column `mute` on the `ChatRoomUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "ChatRoomUser" DROP COLUMN "admins",
DROP COLUMN "mute";
