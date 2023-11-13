/*
  Warnings:

  - Added the required column `ownerId` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PUBLIC', 'PRIVATE', 'PASSWORD');

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "admins" UUID[],
ADD COLUMN     "bans" UUID[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mute" UUID[],
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "type" "ChannelType" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "ChatRoomUser" ADD COLUMN     "admins" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mute" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockList" UUID[];

-- CreateTable
CREATE TABLE "_adminRooms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_mutedRooms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_adminRooms_AB_unique" ON "_adminRooms"("A", "B");

-- CreateIndex
CREATE INDEX "_adminRooms_B_index" ON "_adminRooms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_mutedRooms_AB_unique" ON "_mutedRooms"("A", "B");

-- CreateIndex
CREATE INDEX "_mutedRooms_B_index" ON "_mutedRooms"("B");

-- AddForeignKey
ALTER TABLE "_adminRooms" ADD CONSTRAINT "_adminRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_adminRooms" ADD CONSTRAINT "_adminRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "ChatRoomUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedRooms" ADD CONSTRAINT "_mutedRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mutedRooms" ADD CONSTRAINT "_mutedRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "ChatRoomUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
