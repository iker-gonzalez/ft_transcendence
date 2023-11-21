/*
  Warnings:

  - The values [PASSWORD] on the enum `ChannelType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ChannelType_new" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');
ALTER TABLE "ChatRoom" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "ChatRoom" ALTER COLUMN "type" TYPE "ChannelType_new" USING ("type"::text::"ChannelType_new");
ALTER TYPE "ChannelType" RENAME TO "ChannelType_old";
ALTER TYPE "ChannelType_new" RENAME TO "ChannelType";
DROP TYPE "ChannelType_old";
ALTER TABLE "ChatRoom" ALTER COLUMN "type" SET DEFAULT 'PUBLIC';
COMMIT;
