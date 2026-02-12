-- CreateTable
CREATE TABLE "Transformation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transformation_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChannelMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transformationId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "newName" TEXT NOT NULL,
    CONSTRAINT "ChannelMapping_transformationId_fkey" FOREIGN KEY ("transformationId") REFERENCES "Transformation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Transformation_guildId_name_key" ON "Transformation"("guildId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMapping_transformationId_channelId_key" ON "ChannelMapping"("transformationId", "channelId");
