-- CreateTable
CREATE TABLE "GameDataSetPlayer" (
    "id" TEXT NOT NULL,
    "intraId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "isWinner" BOOLEAN NOT NULL,
    "avatar" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "GameDataSetPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameDataSet" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "elapsedTime" INTEGER NOT NULL,

    CONSTRAINT "GameDataSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GameDataSetToGameDataSetPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GameDataSetPlayer_id_key" ON "GameDataSetPlayer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GameDataSet_id_key" ON "GameDataSet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_GameDataSetToGameDataSetPlayer_AB_unique" ON "_GameDataSetToGameDataSetPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_GameDataSetToGameDataSetPlayer_B_index" ON "_GameDataSetToGameDataSetPlayer"("B");

-- AddForeignKey
ALTER TABLE "_GameDataSetToGameDataSetPlayer" ADD CONSTRAINT "_GameDataSetToGameDataSetPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "GameDataSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameDataSetToGameDataSetPlayer" ADD CONSTRAINT "_GameDataSetToGameDataSetPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "GameDataSetPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
