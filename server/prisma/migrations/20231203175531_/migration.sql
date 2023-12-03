/*
  Warnings:

  - You are about to drop the column `clientId` on the `UserGameSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserGameSession" DROP COLUMN "clientId",
ADD COLUMN     "invitationId" TEXT;
