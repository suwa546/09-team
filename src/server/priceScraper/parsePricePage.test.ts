import { describe, expect, it } from "vitest";
import { paginationUrls, parseNicosumaPricePage } from "./parsePricePage";

describe("parseNicosumaPricePage", () => {
  const html = `<html><head><title>iPhone 15 Pro中古販売｜にこスマ</title></head><body><h1>iPhone 15 Pro中古商品一覧SIMフリー / 3台</h1><a>A-外観プレミアム 詳しく見る iPhone 15 Pro 128GB ¥104,700</a><a>A-外観プレミアム iPhone 15 Pro 256GB ¥118,500</a><a>B-画面クリア iPhone 15 Pro 128GB ¥99,800</a><a>C-目立つ傷なし iPhone 15 Pro 128GB ￥91,000</a></body></html>`;

  it("extracts one minimum reference price for each grade", () => {
    expect(parseNicosumaPricePage(html, "https://www.nicosuma.com/iphone/iphone-15-pro")).toEqual([
      { model: "iPhone 15 Pro", grade: "A", price: 104700, sourceUrl: "https://www.nicosuma.com/iphone/iphone-15-pro" },
      { model: "iPhone 15 Pro", grade: "B", price: 99800, sourceUrl: "https://www.nicosuma.com/iphone/iphone-15-pro" },
      { model: "iPhone 15 Pro", grade: "C", price: 91000, sourceUrl: "https://www.nicosuma.com/iphone/iphone-15-pro" },
    ]);
  });

  it("fails when the page is not a product page", () => expect(() => parseNicosumaPricePage("<h1>トップ</h1>", "https://www.nicosuma.com/")).toThrow());

  it("extracts A, B and C prices from a trade-in page", () => {
    const tradeIn = `<h1>Trade-in Value</h1><p>iPhone 15 Proの買取金額一覧</p><section><div>Aグレード￥67,000</div><div>Bグレード￥18,100</div><div>Cグレード￥6,700</div></section><section><div>Aグレード￥70,000</div><div>Bグレード￥19,000</div><div>Cグレード￥7,000</div></section>`;
    expect(parseNicosumaPricePage(tradeIn, "https://www.nicosuma.com/sell/smartphone/iphone/iphone-15-pro")).toEqual([
      { model: "iPhone 15 Pro", grade: "A", price: 67000, sourceUrl: "https://www.nicosuma.com/sell/smartphone/iphone/iphone-15-pro" },
      { model: "iPhone 15 Pro", grade: "B", price: 18100, sourceUrl: "https://www.nicosuma.com/sell/smartphone/iphone/iphone-15-pro" },
      { model: "iPhone 15 Pro", grade: "C", price: 6700, sourceUrl: "https://www.nicosuma.com/sell/smartphone/iphone/iphone-15-pro" },
    ]);
  });

  it("discovers only bounded pagination links on the same product page", () => {
    const links = `<a href="?cb_page=2">2</a><a href="https://www.nicosuma.com/iphone/iphone-15-pro?cb_page=3">3</a><a href="?cb_grades=A">filter</a><a href="https://example.com/?cb_page=2">other</a>`;
    expect(paginationUrls(links, "https://www.nicosuma.com/iphone/iphone-15-pro")).toEqual(["https://www.nicosuma.com/iphone/iphone-15-pro?cb_page=2", "https://www.nicosuma.com/iphone/iphone-15-pro?cb_page=3"]);
  });
});
