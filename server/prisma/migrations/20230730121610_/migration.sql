/*
  Warnings:

  - Added the required column `avatar` to the `Friend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friend" ADD COLUMN     "avatar" TEXT NOT NULL;
