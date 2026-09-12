import { load } from "cheerio";

export type ScrapedPrice = { model: string; grade: "A" | "B" | "C"; price: number; sourceUrl: string };

function normalizedText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseNicosumaPricePage(html: string, sourceUrl: string): ScrapedPrice[] {
  const $ = load(html);
  const heading = normalizedText($("h1").first().text() || $("title").text());
  const tradeInModel = $("p").toArray().map((element) => normalizedText($(element).text()).match(/^(.*?)の買取金額一覧$/)?.[1]).find(Boolean);
  const model = tradeInModel?.trim() ?? heading.match(/^(.*?)中古(?:商品一覧|販売|スマホ|タブレット)/)?.[1]?.trim();
  if (!model) throw new Error("商品ページから機種名を取得できませんでした。");

  const minimumByGrade = new Map<"A" | "B" | "C", number>();
  $("a").each((_index, element) => {
    const text = normalizedText($(element).text()).replace(/\s/g, "");
    const match = text.match(/^([ABC])[-ー]?[^¥￥]*[¥￥]([\d,]+)/);
    if (!match) return;
    const grade = match[1] as "A" | "B" | "C";
    const price = Number(match[2].replaceAll(",", ""));
    if (!Number.isSafeInteger(price) || price <= 0) return;
    minimumByGrade.set(grade, Math.min(minimumByGrade.get(grade) ?? Number.MAX_SAFE_INTEGER, price));
  });
  const pageText = normalizedText($("body").text()).replace(/\s/g, "");
  for (const match of pageText.matchAll(/([ABC])グレード[¥￥]([\d,]+)/g)) {
    const grade = match[1] as "A" | "B" | "C";
    const price = Number(match[2].replaceAll(",", ""));
    if (!Number.isSafeInteger(price) || price <= 0) continue;
    minimumByGrade.set(grade, Math.min(minimumByGrade.get(grade) ?? Number.MAX_SAFE_INTEGER, price));
  }

  return (["A", "B", "C"] as const).flatMap((grade) => {
    const price = minimumByGrade.get(grade);
    return price ? [{ model, grade, price, sourceUrl }] : [];
  });
}

export function paginationUrls(html: string, sourceUrl: string, maxPages = 5) {
  const $ = load(html);
  const source = new URL(sourceUrl);
  const pages = new Set<string>();
  $("a[href]").each((_index, element) => {
    try {
      const candidate = new URL($(element).attr("href") ?? "", source);
      const page = Number(candidate.searchParams.get("cb_page"));
      if (candidate.origin !== source.origin || candidate.pathname !== source.pathname || candidate.searchParams.size !== 1 || !Number.isInteger(page) || page < 2 || page > maxPages) return;
      pages.add(candidate.toString());
    } catch { /* malformed links are ignored */ }
  });
  return [...pages].sort((left, right) => Number(new URL(left).searchParams.get("cb_page")) - Number(new URL(right).searchParams.get("cb_page")));
}
