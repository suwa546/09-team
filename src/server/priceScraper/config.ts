export const NICOSUMA_ORIGIN = "https://www.nicosuma.com";
export const SCRAPER_USER_AGENT = "smartphone-inspection-system/0.1 (educational price research; low-frequency crawler)";
export const DEFAULT_PRICE_URLS = [
  `${NICOSUMA_ORIGIN}/sell/smartphone/iphone/iphone-15-pro`,
  `${NICOSUMA_ORIGIN}/sell/smartphone/iphone/iphone-14`,
  `${NICOSUMA_ORIGIN}/sell/smartphone/pixel/pixel-7`,
];
export const MIN_REQUEST_DELAY_MS = 2000;
export const DEFAULT_REQUEST_DELAY_MS = 3000;
export const DEFAULT_CACHE_HOURS = 24;
export const MAX_URLS_PER_RUN = 20;

export function assertNicosumaProductUrl(input: string) {
  const url = new URL(input);
  if (url.origin !== NICOSUMA_ORIGIN || url.search || url.hash) {
    throw new Error(`許可されていない取得URLです: ${input}`);
  }
  if (!/^\/(?:(?:iphone|android|ipad|tablet)\/|sell\/(?:smartphone|tablet)\/)/.test(url.pathname)) {
    throw new Error(`商品ページではないURLです: ${input}`);
  }
  return url.toString();
}

export function configuredUrls(cliUrls: string[]) {
  const environmentUrls = process.env.PRICE_SCRAPE_URLS?.split(",").map((url) => url.trim()).filter(Boolean) ?? [];
  const urls = cliUrls.length ? cliUrls : environmentUrls.length ? environmentUrls : DEFAULT_PRICE_URLS;
  if (urls.length > MAX_URLS_PER_RUN) throw new Error(`1回に取得できるURLは${MAX_URLS_PER_RUN}件までです。`);
  return [...new Set(urls.map(assertNicosumaProductUrl))];
}
