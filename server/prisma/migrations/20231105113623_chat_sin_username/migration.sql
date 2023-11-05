/*
  Warnings:

  - You are about to drop the column `receiverAvatar` on the `DirectMessage` table. All the data in the column will be lost.
  - You are about to drop the column `receiverUsername` on the `DirectMessage` table. All the data in the column will be lost.
  - You are about to drop the column `senderAvatar` on the `DirectMessage` table. All the data in the column will be lost.
  - You are about to drop the column `senderUsername` on the `DirectMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DirectMessage" DROP COLUMN "receiverAvatar",
DROP COLUMN "receiverUsername",
DROP COLUMN "senderAvatar",
DROP COLUMN "senderUsername";
