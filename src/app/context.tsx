import { createContext, useContext, type ReactNode } from "react";
import type { SiteData } from "@mochi/data/client";
import type { Chrome, PageData, PageViews } from "@mochi/data/types";

interface SiteContextValue {
  site: SiteData;
  /** 打开搜索弹窗；页头按钮和 ⌘K 共用 */
  openSearch: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);
const PageContext = createContext<PageData | null>(null);

export function SiteProvider({ value, children }: { value: SiteContextValue; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function PageProvider({ page, children }: { page: PageData; children: ReactNode }) {
  return <PageContext.Provider value={page}>{children}</PageContext.Provider>;
}

export function useSite(): SiteContextValue {
  const value = useContext(SiteContext);
  if (!value) throw new Error("站点上下文缺失");
  return value;
}

/** 外壳数据：有页面时取页面的（带当前项目高亮），否则取清单的 */
export function useChrome(): Chrome {
  const page = useContext(PageContext);
  const { site } = useSite();
  return page ?? site.chrome();
}

export function usePage(): PageData {
  const value = useContext(PageContext);
  if (!value) throw new Error("页面上下文缺失");
  return value;
}

/** 只取指定类型的页面内容，类型不符说明路由与页面组件接错了 */
export function usePageOf<T extends keyof PageViews>(type: T): PageViews[T] {
  const { page } = usePage();
  if (page.type !== type) throw new Error(`页面类型应为 ${type}，实际为 ${page.type}`);
  return page.content as PageViews[T];
}
