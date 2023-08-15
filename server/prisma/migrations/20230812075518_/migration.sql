-- CreateTable
CREATE TABLE "UserGameSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIntraData" (
    "id" TEXT NOT NULL,
    "intraId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userGameSessionId" TEXT,

    CONSTRAINT "UserIntraData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGameSession_id_key" ON "UserGameSession"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserIntraData_id_key" ON "UserIntraData"("id");

-- AddForeignKey
ALTER TABLE "UserIntraData" ADD CONSTRAINT "UserIntraData_userGameSessionId_fkey" FOREIGN KEY ("userGameSessionId") REFERENCES "UserGameSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
