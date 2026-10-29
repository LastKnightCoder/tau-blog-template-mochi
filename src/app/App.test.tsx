import { act } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@mochi/test-utils";
import { demoData } from "../../scripts/dev-fixture.mjs";
import { SiteData } from "@mochi/data/client";
import { App } from "./App";
import { configureBase, navigate } from "./navigation";

const ORIGIN = "http://mochi.test";
let site: SiteData;

/** 用开发夹具当发布站点：fetch 直接返回内存里的数据文件 */
beforeAll(async () => {
  vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
    const body = demoData.files.get(new URL(String(input), ORIGIN).pathname);
    return body ? new Response(body, { headers: { "Content-Type": "application/json" } }) : new Response("", { status: 404 });
  });
  site = await SiteData.open(`${ORIGIN}${demoData.manifestUrl}`);
  configureBase("/");
});

beforeEach(() => {
  window.scrollTo = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  window.history.replaceState(null, "", "/");
  localStorage.clear();
});

afterEach(() => {
  document.documentElement.dataset.mode = "light";
});

async function settle(check: () => boolean, label: string) {
  await vi.waitFor(
    async () => {
      await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
      if (!check()) throw new Error(`没有等到：${label} ｜ ${document.body.textContent?.slice(0, 300)}`);
    },
    { timeout: 4000 },
  );
}

async function open(route: string) {
  window.history.replaceState(null, "", route);
  const view = render(<App site={site} />);
  return view;
}

const text = () => document.body.textContent ?? "";

describe("页面", () => {
  it("首页：站名、团子与店印、三个分区、最近做好的", async () => {
    await open("/");
    await settle(() => text().includes("最近做好的"), "首页");
    expect(document.querySelector("h1")!.getAttribute("aria-label")).toBe("团子的小窝");
    expect(text()).toContain("慢慢写，慢慢长大");
    expect(text()).toContain("今日现做");
    const menu = [...document.querySelectorAll('nav[aria-label="分区"] h2')].map((title) => title.textContent);
    expect(menu).toEqual(["文章", "卡片", "项目"]);
    expect(document.querySelectorAll("#recent-title ~ ul li")).toHaveLength(6);
    expect(document.querySelector('button[aria-label="团子，戳一下"]')).not.toBeNull();
  });

  it("文章列表：按标签筛选，筛选写在地址上", async () => {
    await open("/articles");
    await settle(() => text().includes("写给你的长信") && document.querySelectorAll('main a[href^="/articles/"]').length === 3, "文章列表");
    const coffee = [...document.querySelectorAll<HTMLButtonElement>('nav[aria-label="按标签筛选"] button[aria-pressed]')].find((button) => button.textContent?.startsWith("咖啡"))!;
    await act(async () => coffee.click());
    await settle(() => document.querySelectorAll('main a[href^="/articles/"]').length === 1, "筛选后只剩一封");
    expect(window.location.search).toBe("?tag=%E5%92%96%E5%95%A1");
  });

  it("文章详情：标题、目录、正文与标签", async () => {
    await open("/articles/1");
    await settle(() => text().includes("在家做一杯好喝的手冲咖啡") && !!document.querySelector('nav[aria-label="目录"]'), "文章与目录");
    const toc = [...document.querySelectorAll('nav[aria-label="目录"] li')].map((item) => item.textContent);
    expect(toc).toEqual(["先选一包新鲜的豆子", "水温和粉水比", "注水的节奏", "写在最后"]);
    expect(document.querySelector("[data-slate-editor].mochi-prose")!.textContent).toContain("粉水比");
    expect(document.querySelector('.mochi-prose a.mochi-link[href="/cards/1"]')).not.toBeNull();
  });

  it("卡片列表：一盒点心格，按子标签筛选", async () => {
    await open("/cards?tag=%E6%80%9D%E8%80%83%2F%E5%AD%A6%E4%B9%A0");
    await settle(() => document.querySelectorAll("main ul.grid > li").length === 2, "按子标签筛选");
    expect(text()).toContain("思考 / 学习2 张");
    // 当前标签的上级自动展开，选中项是子标签「学习」
    const pressed = document.querySelector('nav[aria-label="按标签筛选"] button[aria-pressed="true"]')!;
    expect(pressed.textContent).toBe("学习2");
    expect(document.querySelector('button[aria-label="收起「思考」的子标签"]')).not.toBeNull();
    expect(document.querySelector("main section h2")!.textContent).toMatch(/\d{4} 年 \d+ 月/);
  });

  it("卡片列表：标签多时可以搜索标签", async () => {
    await open("/cards");
    await settle(() => document.querySelectorAll("main ul.grid li").length === 6, "卡片列表");
    const input = document.querySelector<HTMLInputElement>('input[aria-label="找标签"]')!;
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setValue.call(input, "写");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const options = [...document.querySelectorAll('nav[aria-label="按标签筛选"] button[aria-pressed]')].map((button) => button.textContent);
    expect(options).toEqual(["思考 / 写作1"]);
    await act(async () => document.querySelector<HTMLButtonElement>('nav[aria-label="按标签筛选"] button[aria-pressed]')!.click());
    await settle(() => document.querySelectorAll("main ul.grid li").length === 1, "选中搜索结果");
    expect(decodeURIComponent(window.location.search)).toBe("?tag=思考/写作");
  });

  it("卡片详情：正文与连着的卡片", async () => {
    await open("/cards/1");
    await settle(() => text().includes("连着的卡片") && text().includes("费曼学习法"), "卡片详情");
    expect(document.querySelectorAll('aside[aria-labelledby="linked-title"] li')).toHaveLength(2);
  });

  it("项目文档：细线目录标出当前页与读过的页，翻页指向前后文档", async () => {
    await open("/projects/12/34");
    await settle(() => text().includes("卡片与双链") && !!document.querySelector('nav[aria-label="文档目录"]'), "文档页");
    expect(document.querySelector('nav[aria-label="文档目录"] a[aria-current="page"]')!.textContent).toBe("卡片与双链");
    expect(document.querySelector('a[rel="prev"]')!.getAttribute("href")).toBe("/projects/12/33");
    expect(document.querySelector('a[rel="next"]')!.getAttribute("href")).toBe("/projects/12/35");
    expect(document.querySelectorAll('nav[aria-label="文档目录"] [aria-label="读过"]')).toHaveLength(1);
  });

  it("未知地址：迷路的团子，页头保留", async () => {
    await open("/nowhere");
    await settle(() => text().includes("团子找不到这一页了"), "404");
    expect(document.querySelector("header")).not.toBeNull();
    expect(document.title).toContain("找不到这一页");
  });
});

describe("导航与交互", () => {
  it("站内跳转不重载页面，导航高亮当前分区", async () => {
    await open("/");
    await settle(() => text().includes("最近做好的"), "首页");
    await act(async () => navigate("/cards"));
    await settle(() => text().includes("一盒随手记下的小想法"), "卡片列表");
    expect(document.querySelector('nav[aria-label="主导航"] a[aria-current="page"]')!.textContent).toBe("卡片");
  });

  it("⌘K 打开搜索，输入后列出命中并高亮", async () => {
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.open = false;
    };
    await open("/");
    await settle(() => text().includes("最近做好的"), "首页");
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
    });
    const input = await vi.waitFor(() => {
      const element = document.querySelector<HTMLInputElement>('dialog input[role="combobox"]');
      if (!element) throw new Error("搜索框没有出现");
      return element;
    });
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setValue.call(input, "咖啡");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await settle(() => document.querySelectorAll('[role="option"]').length > 0, "搜索结果");
    expect(document.querySelector('[role="option"] em')!.textContent).toBe("咖啡");
  });

  it("日夜开关写回 data-mode 并记住选择", async () => {
    await open("/");
    await settle(() => !!document.querySelector('button[role="switch"]'), "开关");
    await act(async () => document.querySelector<HTMLButtonElement>('button[role="switch"]')!.click());
    expect(document.documentElement.dataset.mode).toBe("dark");
    expect(localStorage.getItem("mochi:mode")).toBe("dark");
    expect(document.querySelector('button[role="switch"]')!.getAttribute("aria-checked")).toBe("true");
  });
});

describe("首页分区", () => {
  it("七天内的新内容在分区上标出数量", async () => {
    // 夹具按 2026-10-28 生成，「7 天内新内容」要在同一天判断
    vi.useFakeTimers({ toFake: ["Date"], now: Date.UTC(2026, 9, 28, 2) });
    await open("/");
    await settle(() => text().includes("最近做好的"), "首页");
    const articles = document.querySelector<HTMLAnchorElement>('nav[aria-label="分区"] a[href="/articles"]')!;
    expect(articles.textContent).toContain("新到 1 篇");
    expect(articles.querySelector("svg")).not.toBeNull();
    vi.useRealTimers();
  });
});
