import type * as Published from "@tau/blog";
import type { DataManifest, DataResult } from "@tau/blog";
import { joinBase, type RouteTable } from "./routes";
import { readSiteSettings } from "./site";
import type { Chrome, DocCollectionView, NavItem, PageContent, PageData, SidebarNode } from "./types";

/** 把 ContentRef 换成带 basePath 的地址；目标未发布的条目直接丢掉，页面上不出现死链 */
function linker(routes: RouteTable, basePath: string) {
  const href = (ref: Published.ContentRef) => {
    const route = routes.routeFor(ref);
    return route === undefined ? undefined : joinBase(basePath, route);
  };
  const linkAll = <T extends { target: Published.ContentRef }>(items: readonly T[]) =>
    items.flatMap((item) => {
      const link = href(item.target);
      return link === undefined ? [] : [{ ...item, href: link }];
    });
  return { href, linkAll };
}

function adaptPage(data: Published.PublishedData, link: ReturnType<typeof linker>): PageContent {
  switch (data.meta.type) {
    case "home": {
      const content = data.content as Published.HomeData;
      return { type: "home", content: { ...content, timeline: link.linkAll(content.timeline) } };
    }
    case "list": {
      const content = data.content as Published.ListData;
      return { type: "list", content: { ...content, items: link.linkAll(content.items) } };
    }
    case "card": {
      const content = data.content as Published.CardData;
      return { type: "card", content: { ...content, linkedCards: link.linkAll(content.linkedCards ?? []) } };
    }
    case "article":
      return { type: "article", content: data.content as Published.ArticleData };
    case "doc": {
      const content = data.content as Published.DocData;
      const turn = (page?: { title: string; target: Published.ContentRef }) => {
        const href = page && link.href(page.target);
        return page && href ? { title: page.title, href } : undefined;
      };
      return {
        type: "doc",
        content: {
          ...content,
          currentPath: link.href({ key: data.key, type: "doc" }) ?? "",
          breadcrumb: content.breadcrumb.map((item) => ({ label: item.label, href: item.target && link.href(item.target) })),
          prevPage: turn(content.prevPage),
          nextPage: turn(content.nextPage),
        },
      };
    }
  }
}

function sidebar(items: readonly Published.TreeItem[], link: ReturnType<typeof linker>): SidebarNode[] {
  return items.map((item) => ({
    title: item.title,
    href: item.target && link.href(item.target),
    children: item.children?.length ? sidebar(item.children, link) : undefined,
  }));
}

function navigation(manifest: DataManifest, basePath: string): NavItem[] {
  const lists = new Set(manifest.items.filter((item) => item.type === "list").map((item) => item.collectionType));
  const nav: NavItem[] = [];
  if (lists.has("article")) nav.push({ label: "文章", href: joinBase(basePath, "/articles"), kind: "articles" });
  if (lists.has("card")) nav.push({ label: "卡片", href: joinBase(basePath, "/cards"), kind: "cards" });
  return nav;
}

/** 页头、页脚与书架只依赖清单，找不到页面时也能完整显示 */
export function chromeOf(manifest: DataManifest, routes: RouteTable, activeProjectId?: number): Chrome {
  const site = readSiteSettings(manifest.site);
  const link = linker(routes, site.basePath);
  const collections: DocCollectionView[] = (manifest.collections ?? []).map((collection) => ({
    label: collection.label,
    items: collection.items.flatMap((item) => {
      const href = link.href(item.target);
      return href ? [{ id: item.id, title: item.title, href, active: item.id === activeProjectId }] : [];
    }),
  }));
  return {
    site,
    navigation: navigation(manifest, site.basePath),
    collections: collections.filter((collection) => collection.items.length > 0),
  };
}

export function adaptData(result: DataResult, manifest: DataManifest, routes: RouteTable): PageData {
  const { data } = result;
  const projectId = manifest.items.find((item) => item.key === data.key)?.projectId;
  const chrome = chromeOf(manifest, routes, projectId);
  const link = linker(routes, chrome.site.basePath);
  const tree = projectId === undefined ? undefined : manifest.projectTrees?.[String(projectId)];
  return {
    ...chrome,
    key: data.key,
    page: adaptPage(data, link),
    result,
    sidebar: tree && sidebar(tree, link),
  };
}
