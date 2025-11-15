-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateTable
CREATE TABLE "domain_aliases" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "primaryTags" TEXT[],
    "secondaryTags" TEXT[],
    "status" "DomainStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "lastVisit" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "websiteId" TEXT NOT NULL,

    CONSTRAINT "domain_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domain_aliases_domain_key" ON "domain_aliases"("domain");

-- CreateIndex
CREATE INDEX "domain_aliases_websiteId_status_idx" ON "domain_aliases"("websiteId", "status");

-- CreateIndex
CREATE INDEX "domain_aliases_domain_idx" ON "domain_aliases"("domain");

-- AddForeignKey
ALTER TABLE "domain_aliases" ADD CONSTRAINT "domain_aliases_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
