/*
  Warnings:

  - You are about to drop the column `conversationsIds` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "conversationsIds",
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'male';
