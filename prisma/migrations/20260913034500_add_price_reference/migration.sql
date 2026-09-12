CREATE TABLE "PriceReference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "model" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "PriceReference_model_grade_fetchedAt_idx" ON "PriceReference"("model", "grade", "fetchedAt");
CREATE INDEX "PriceReference_sourceUrl_fetchedAt_idx" ON "PriceReference"("sourceUrl", "fetchedAt");
