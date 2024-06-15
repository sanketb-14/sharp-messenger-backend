/*
  Warnings:

  - You are about to drop the `_ChatUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChatUsers" DROP CONSTRAINT "_ChatUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatUsers" DROP CONSTRAINT "_ChatUsers_B_fkey";

-- DropTable
DROP TABLE "_ChatUsers";

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
