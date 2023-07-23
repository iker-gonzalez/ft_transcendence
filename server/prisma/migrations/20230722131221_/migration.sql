-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSessionPlayer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameSessionId" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "GameSessionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_id_key" ON "GameSession"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionPlayer_id_key" ON "GameSessionPlayer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionPlayer_userId_key" ON "GameSessionPlayer"("userId");

-- AddForeignKey
ALTER TABLE "GameSessionPlayer" ADD CONSTRAINT "GameSessionPlayer_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessionPlayer" ADD CONSTRAINT "GameSessionPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("intraId") ON DELETE RESTRICT ON UPDATE CASCADE;
