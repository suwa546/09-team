import "dotenv/config";
import { prisma } from "@/src/lib/prisma";
import { configuredUrls } from "./config";
import { scrapePrices } from "./scrapePrices";

async function main() {
  const force = process.argv.includes("--force");
  const args = process.argv.slice(2).filter((argument) => argument !== "--force");
  const urls = configuredUrls(args);
  console.log(`robots.txtを確認し、${urls.length}件の商品ページを最大20件・低頻度で取得します。`);
  const summary = await scrapePrices(urls, { force });
  for (const price of summary.prices) console.log(`${price.model} / ${price.grade}: ¥${price.price.toLocaleString("ja-JP")}`);
  console.log(`完了: ページ取得 ${summary.fetched}件、キャッシュ利用 ${summary.cached}件、価格保存 ${summary.saved}件`);
}

main()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
