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
  it("首页：站名、三栋房子、最近寄到、站点描述", async () => {
    await open("/");
    await settle(() => text().includes("最近寄到"), "首页");
    expect(document.querySelector("h1")!.getAttribute("aria-label")).toBe("团子的小窝");
    for (const name of ["邮局", "便签屋", "图书馆"]) expect(text()).toContain(name);
    expect(text()).toContain("慢慢写，慢慢长大");
    expect(document.querySelectorAll("#mailbox-title ~ ul li")).toHaveLength(5);
  });

  it("文章列表：信纸按标签筛选，筛选写在地址上", async () => {
    await open("/articles");
    await settle(() => text().includes("邮局") && document.querySelectorAll('a[href^="/articles/"]').length === 3, "文章列表");
    const coffee = [...document.querySelectorAll<HTMLButtonElement>("button[aria-pressed]")].find((button) => button.textContent === "咖啡")!;
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

  it("卡片列表：标签罐子筛选子标签", async () => {
    await open("/cards?tag=%E6%80%9D%E8%80%83%2F%E5%AD%A6%E4%B9%A0");
    await settle(() => text().includes("「思考/学习」罐子里有 2 张便签"), "按子标签筛选");
  });

  it("卡片详情：正文与红线连着的便签", async () => {
    await open("/cards/1");
    await settle(() => text().includes("用红线连着的便签") && text().includes("费曼学习法"), "卡片详情");
    expect(document.querySelectorAll("[data-yarn-end]")).toHaveLength(2);
  });

  it("项目文档：寻宝小路标出当前页与读过的页，翻页指向前后文档", async () => {
    await open("/projects/12/34");
    await settle(() => text().includes("卡片与双链") && !!document.querySelector('nav[aria-label="文档目录"]'), "文档页");
    expect(document.querySelector('nav[aria-label="文档目录"] a[aria-current="page"]')!.textContent).toBe("卡片与双链");
    expect(document.querySelector('a[rel="prev"]')!.getAttribute("href")).toBe("/projects/12/33");
    expect(document.querySelector('a[rel="next"]')!.getAttribute("href")).toBe("/projects/12/35");
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
    await settle(() => text().includes("最近寄到"), "首页");
    await act(async () => navigate("/cards"));
    await settle(() => text().includes("便签屋") && text().includes("墙上钉着"), "卡片列表");
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
    await settle(() => text().includes("最近寄到"), "首页");
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

describe("首页小屋", () => {
  it("三栋绘本小屋各有自己的样子，门里藏着团子，新内容有角标", async () => {
    // 夹具按 2026-10-28 生成，「7 天内新内容」要在同一天判断
    vi.useFakeTimers({ toFake: ["Date"], now: Date.UTC(2026, 9, 28, 2) });
    await open("/");
    await settle(() => text().includes("最近寄到"), "首页");
    const houses = [...document.querySelectorAll<HTMLAnchorElement>("main a.group")].filter((link) => link.querySelector("svg[aria-hidden] path"));
    expect(houses.map((house) => house.querySelector(":scope > div:last-child")!.firstChild!.textContent)).toEqual(["邮局", "便签屋", "图书馆"]);
    const drawings = houses.map((house) => house.querySelector("svg")!.innerHTML);
    expect(new Set(drawings).size).toBe(3);
    for (const house of houses) expect(house.querySelector(".bg-ink svg.mochi-svg")).not.toBeNull();
    expect(houses[0].getAttribute("href")).toBe("/articles");
    expect(houses[0].textContent).toContain("篇新内容");
    vi.useRealTimers();
  });
});
