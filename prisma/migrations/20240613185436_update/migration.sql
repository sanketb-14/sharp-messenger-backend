-- CreateTable
CREATE TABLE "Chat" (
    "chatId" SERIAL NOT NULL,
    "isGroupChat" BOOLEAN NOT NULL DEFAULT false,
    "chatName" TEXT,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("chatId")
);

-- CreateTable
CREATE TABLE "_ChatUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatUsers_AB_unique" ON "_ChatUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatUsers_B_index" ON "_ChatUsers"("B");

-- AddForeignKey
ALTER TABLE "_ChatUsers" ADD CONSTRAINT "_ChatUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("chatId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatUsers" ADD CONSTRAINT "_ChatUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
