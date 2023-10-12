/*
  Warnings:

  - Added the required column `sessionId` to the `GameDataSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameDataSet" ADD COLUMN     "sessionId" TEXT NOT NULL;
