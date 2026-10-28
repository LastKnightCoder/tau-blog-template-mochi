import type { ContentRef, ManifestItem } from "@tau/blog";

/** 站内路由，不含 basePath；与官方模板一致，换模板后旧链接仍然有效 */
export function routeOf(item: ManifestItem): string {
  switch (item.type) {
    case "home":
      return "/";
    case "doc":
      return `/projects/${item.projectId}/${item.id}`;
    case "list": {
      if (!item.collectionType) throw new Error("集合数据缺少业务类型");
      return { card: "/cards", article: "/articles", doc: "/projects" }[item.collectionType];
    }
    default:
      return `/${item.type}s/${item.id}`;
  }
}

export class RouteTable {
  private readonly byKey = new Map<string, string>();
  private readonly byRoute = new Map<string, string>();

  constructor(items: readonly ManifestItem[]) {
    for (const item of items) {
      const route = routeOf(item);
      this.byKey.set(item.key, route);
      this.byRoute.set(route, item.key);
    }
  }

  /** 目标未发布时返回 undefined，调用方决定显示成纯文字还是隐藏 */
  routeFor(ref: ContentRef): string | undefined {
    return this.byKey.get(ref.key);
  }

  keyFor(pathname: string): string | undefined {
    return this.byRoute.get(normalizeRoute(pathname));
  }
}

export function normalizeRoute(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

/** 站内路由加上部署路径，得到页面上真正的链接地址 */
export function joinBase(basePath: string, route: string): string {
  const base = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return base + route.replace(/^\//, "");
}
