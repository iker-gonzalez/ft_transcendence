/*
  Warnings:

  - You are about to drop the `_bannedRooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_bannedRooms" DROP CONSTRAINT "_bannedRooms_A_fkey";

-- DropForeignKey
ALTER TABLE "_bannedRooms" DROP CONSTRAINT "_bannedRooms_B_fkey";

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "bannedkList" UUID[];

-- DropTable
DROP TABLE "_bannedRooms";
