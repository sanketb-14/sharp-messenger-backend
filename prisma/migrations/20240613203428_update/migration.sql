/*
  Warnings:

  - Added the required column `profileId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_chatId_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "profileId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
