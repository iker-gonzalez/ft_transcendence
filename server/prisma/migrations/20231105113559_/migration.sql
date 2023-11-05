/*
  Warnings:

  - Added the required column `receiverAvatar` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverUsername` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderAvatar` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "receiverAvatar" TEXT NOT NULL,
ADD COLUMN     "receiverUsername" TEXT NOT NULL,
ADD COLUMN     "senderAvatar" TEXT NOT NULL,
ADD COLUMN     "senderUsername" TEXT;
