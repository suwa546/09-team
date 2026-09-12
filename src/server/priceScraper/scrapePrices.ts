import robotsParser from "robots-parser";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_CACHE_HOURS, DEFAULT_REQUEST_DELAY_MS, MIN_REQUEST_DELAY_MS, NICOSUMA_ORIGIN, SCRAPER_USER_AGENT } from "./config";
import { paginationUrls, parseNicosumaPricePage, type ScrapedPrice } from "./parsePricePage";

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { headers: { "User-Agent": SCRAPER_USER_AGENT, Accept: "text/html,text/plain" }, redirect: "follow", signal: controller.signal });
    if (!response.ok) throw new Error(`${url} の取得に失敗しました (${response.status})`);
    return response.text();
  } finally { clearTimeout(timeout); }
}

export type ScrapeSummary = { fetched: number; cached: number; saved: number; prices: ScrapedPrice[] };

export async function scrapePrices(urls: string[], options: { force?: boolean; client?: PrismaClient } = {}): Promise<ScrapeSummary> {
  const client = options.client ?? prisma;
  const robotsUrl = `${NICOSUMA_ORIGIN}/robots.txt`;
  const robots = robotsParser(robotsUrl, await fetchText(robotsUrl));
  const configuredDelay = Number(process.env.PRICE_SCRAPE_DELAY_MS || DEFAULT_REQUEST_DELAY_MS);
  const robotsDelay = (robots.getCrawlDelay(SCRAPER_USER_AGENT) ?? robots.getCrawlDelay("*") ?? 0) * 1000;
  const requestDelay = Math.max(MIN_REQUEST_DELAY_MS, Number.isFinite(configuredDelay) ? configuredDelay : DEFAULT_REQUEST_DELAY_MS, robotsDelay);
  const cacheHours = Math.max(1, Number(process.env.PRICE_CACHE_HOURS || DEFAULT_CACHE_HOURS) || DEFAULT_CACHE_HOURS);
  const cacheCutoff = new Date(Date.now() - cacheHours * 60 * 60 * 1000);
  const summary: ScrapeSummary = { fetched: 0, cached: 0, saved: 0, prices: [] };
  let previousRequestAt = 0;

  const fetchRespectfully = async (url: string) => {
    if (!robots.isAllowed(url, SCRAPER_USER_AGENT)) throw new Error(`robots.txtで許可されていないURLです: ${url}`);
    const wait = Math.max(0, previousRequestAt + requestDelay - Date.now());
    if (wait) await sleep(wait);
    const html = await fetchText(url); previousRequestAt = Date.now(); summary.fetched++;
    return html;
  };

  for (const url of urls) {
    if (!robots.isAllowed(url, SCRAPER_USER_AGENT)) throw new Error(`robots.txtで許可されていないURLです: ${url}`);
    if (!options.force) {
      const cached = await client.priceReference.findFirst({ where: { sourceUrl: url, fetchedAt: { gte: cacheCutoff } }, orderBy: { fetchedAt: "desc" } });
      if (cached) { summary.cached++; continue; }
    }
    const firstHtml = await fetchRespectfully(url);
    const candidates = [...parseNicosumaPricePage(firstHtml, url)];
    for (const pageUrl of paginationUrls(firstHtml, url)) {
      if (new Set(candidates.map((price) => price.grade)).size === 3) break;
      candidates.push(...parseNicosumaPricePage(await fetchRespectfully(pageUrl), url));
    }
    const prices = (["A", "B", "C"] as const).flatMap((grade) => {
      const matches = candidates.filter((price) => price.grade === grade);
      return matches.length ? [{ ...matches[0], price: Math.min(...matches.map((price) => price.price)) }] : [];
    });
    if (!prices.length) throw new Error(`${url} から価格を取得できませんでした。ページ構造を確認してください。`);
    await client.priceReference.createMany({ data: prices });
    summary.saved += prices.length; summary.prices.push(...prices);
  }
  return summary;
}
