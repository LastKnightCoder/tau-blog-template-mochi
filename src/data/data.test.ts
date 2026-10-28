import { describe, expect, it, vi } from "vitest";
import type { DataClient, DataManifest, DataResult } from "@tau/blog";
import { SiteData } from "./client";
import { joinBase, RouteTable } from "./routes";
import { readSiteSettings } from "./site";

vi.mock("@tau/blog", () => ({ createClient: vi.fn() }));

const doc = { key: "opaque-doc", type: "doc" as const, id: 34, projectId: 12, title: "文档", data: "d.json", integrity: "" };
const manifest: DataManifest = {
  version: 1,
  site: { title: "团子的小窝", basePath: "/notes/", fields: {} },
  search: { data: "index/search.json", integrity: "" },
  items: [
    { key: "home", type: "home", title: "首页", data: "h.json", integrity: "" },
    { key: "opaque-article-list", type: "list", collectionType: "article", title: "文章", data: "l.json", integrity: "" },
    { key: "a1", type: "article", id: 1, title: "文章", data: "a.json", integrity: "" },
    doc,
  ],
  collections: [{ type: "project", label: "项目", items: [{ id: 12, title: "指南", target: doc, kind: "project" }] }],
  cardTagTree: [{ tag: "思考", count: 3, cards: [], children: [{ tag: "学习", count: 2, cards: [] }] }],
  projectTrees: { "12": [{ title: "分组", children: [{ title: "文档", target: doc }] }] },
};

const result = (key: string, type: DataResult["data"]["meta"]["type"], content: object) =>
  ({ dataUrl: "https://cdn.example/d.json", data: { version: 1, key, meta: { type, publishTime: 0 }, content } }) as DataResult;

async function open(read: (key: string) => DataResult = () => result("home", "home", { timeline: [] })) {
  const client: DataClient = {
    readManifest: vi.fn(async () => manifest),
    readData: vi.fn(async ({ key }) => read(key)),
    search: vi.fn(),
  };
  return { client, site: await SiteData.open("https://cdn.example/releases/site.json", client) };
}

describe("路由", () => {
  it("与官方模板同一套地址，key 不出现在路径里", () => {
    const routes = new RouteTable(manifest.items);
    expect(routes.routeFor(doc)).toBe("/projects/12/34");
    expect(routes.routeFor({ key: "a1", type: "article" })).toBe("/articles/1");
    expect(routes.keyFor("/articles/")).toBe("opaque-article-list");
    expect(routes.keyFor("/")).toBe("home");
    expect(routes.routeFor({ key: "missing", type: "card" })).toBeUndefined();
  });

  it("joinBase 处理有无结尾斜杠的部署路径", () => {
    expect(joinBase("/notes", "/cards")).toBe("/notes/cards");
    expect(joinBase("/notes/", "/")).toBe("/notes/");
  });
});

describe("页面数据", () => {
  it("未知路由返回 null，交给迷路页", async () => {
    const { site, client } = await open();
    expect(await site.readPage("/nowhere")).toBeNull();
    expect(client.readData).not.toHaveBeenCalled();
  });

  it("所有站内引用换成带部署路径的地址，未发布的目标被丢掉", async () => {
    const { site } = await open((key) =>
      result(key, "home", { timeline: [{ target: doc, title: "已发布" }, { target: { key: "gone", type: "card" }, title: "已撤下" }] }),
    );
    const page = await site.readPage("/");
    expect(page!.page.type).toBe("home");
    const timeline = page!.page.type === "home" ? page!.page.content.timeline : [];
    expect(timeline).toEqual([expect.objectContaining({ title: "已发布", href: "/notes/projects/12/34" })]);
  });

  it("文档页带侧栏、面包屑、翻页与当前项目高亮", async () => {
    const { site } = await open((key) =>
      result(key, "doc", {
        breadcrumb: [{ label: "分组" }, { label: "文档", target: doc }],
        prevPage: { title: "上一篇", target: doc },
        nextPage: { title: "撤下的", target: { key: "gone", type: "doc" } },
      }),
    );
    const page = (await site.readPage("/projects/12/34"))!;
    if (page.page.type !== "doc") throw new Error("应为文档页");
    expect(page.page.content.currentPath).toBe("/notes/projects/12/34");
    expect(page.page.content.breadcrumb).toEqual([{ label: "分组", href: undefined }, { label: "文档", href: "/notes/projects/12/34" }]);
    expect(page.page.content.prevPage).toEqual({ title: "上一篇", href: "/notes/projects/12/34" });
    expect(page.page.content.nextPage).toBeUndefined();
    expect(page.sidebar).toEqual([{ title: "分组", href: undefined, children: [{ title: "文档", href: "/notes/projects/12/34", children: undefined }] }]);
    expect(page.collections[0].items[0]).toMatchObject({ active: true, href: "/notes/projects/12/34" });
  });

  it("导航只列出已发布的集合，标签树带完整路径", async () => {
    const { site } = await open();
    const page = (await site.readPage("/"))!;
    expect(page.navigation.map((item) => item.label)).toEqual(["文章"]);
    expect(page.tagTree[0].children[0]).toMatchObject({ tag: "学习", path: "思考/学习", count: 2 });
  });

  it("搜索索引地址相对清单解析", async () => {
    const { site } = await open();
    expect(site.searchUrl).toBe("https://cdn.example/releases/index/search.json");
  });
});

describe("站点设置", () => {
  it("缺省时给出可用的默认值", () => {
    const settings = readSiteSettings({ title: "站", basePath: "/", fields: {} });
    expect(settings).toMatchObject({ mascotName: "团子", mascotColor: "sakura", ambient: true, description: "" });
    expect(settings.mascotLines.length).toBeGreaterThan(0);
  });

  it("异常值回落，口头禅按行切分并限长", () => {
    const settings = readSiteSettings({
      title: "站",
      basePath: "/",
      fields: { mascotColor: "rainbow", mascotLines: "  第一句 \n\n第二句\n" + "长".repeat(80), ambient: false, mascotName: "  小麻薯  " },
    });
    expect(settings.mascotColor).toBe("sakura");
    expect(settings.mascotLines).toEqual(["第一句", "第二句", "长".repeat(40)]);
    expect(settings.ambient).toBe(false);
    expect(settings.mascotName).toBe("小麻薯");
  });
});
