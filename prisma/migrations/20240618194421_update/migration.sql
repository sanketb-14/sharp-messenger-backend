/*
  Warnings:

  - Made the column `profilePic` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profilePic" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL;
