-- CreateTable
CREATE TABLE "_bannedRooms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_bannedRooms_AB_unique" ON "_bannedRooms"("A", "B");

-- CreateIndex
CREATE INDEX "_bannedRooms_B_index" ON "_bannedRooms"("B");

-- AddForeignKey
ALTER TABLE "_bannedRooms" ADD CONSTRAINT "_bannedRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bannedRooms" ADD CONSTRAINT "_bannedRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "ChatRoomUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
