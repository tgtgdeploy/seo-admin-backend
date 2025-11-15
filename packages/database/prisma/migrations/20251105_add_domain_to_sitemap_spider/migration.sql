-- AlterTable: Add domainAliasId to sitemaps
ALTER TABLE "sitemaps" ADD COLUMN "domainAliasId" TEXT;

-- AlterTable: Add domainAliasId to spider_logs
ALTER TABLE "spider_logs" ADD COLUMN "domainAliasId" TEXT;

-- CreateIndex
CREATE INDEX "sitemaps_websiteId_domainAliasId_idx" ON "sitemaps"("websiteId", "domainAliasId");

-- CreateIndex
CREATE INDEX "spider_logs_domainAliasId_bot_createdAt_idx" ON "spider_logs"("domainAliasId", "bot", "createdAt");

-- AddForeignKey
ALTER TABLE "sitemaps" ADD CONSTRAINT "sitemaps_domainAliasId_fkey" FOREIGN KEY ("domainAliasId") REFERENCES "domain_aliases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spider_logs" ADD CONSTRAINT "spider_logs_domainAliasId_fkey" FOREIGN KEY ("domainAliasId") REFERENCES "domain_aliases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
