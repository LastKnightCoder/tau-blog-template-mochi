import { useSyncExternalStore } from "react";

/**
 * 极简的地址栏路由：页面全是 <a href>，点击站内链接时改用 pushState，避免整页重载。
 * 站外链接、新窗口和修饰键点击交给浏览器。
 */
const CHANGE_EVENT = "mochi-navigate";
let basePath = "/";

export function configureBase(base: string) {
  basePath = base.endsWith("/") ? base : `${base}/`;
}

export interface Location {
  /** 站内路由，不含 basePath */
  route: string;
  search: string;
  hash: string;
}

let cached: Location | undefined;
let cachedHref = "";

function read(): Location {
  if (window.location.href === cachedHref && cached) return cached;
  const { pathname, search, hash } = window.location;
  const inside = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname.replace(/^\//, "");
  cachedHref = window.location.href;
  cached = { route: `/${inside}`, search, hash };
  return cached;
}

export function useLocation(): Location {
  return useSyncExternalStore(
    (listener) => {
      window.addEventListener(CHANGE_EVENT, listener);
      window.addEventListener("popstate", listener);
      return () => {
        window.removeEventListener(CHANGE_EVENT, listener);
        window.removeEventListener("popstate", listener);
      };
    },
    read,
    read,
  );
}

/** 同站且在部署路径内的地址；只改锚点时返回 undefined，让浏览器自己滚动 */
export function siteUrl(href: string): URL | undefined {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return undefined;
  if (!url.pathname.startsWith(basePath) && `${url.pathname}/` !== basePath) return undefined;
  const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
  if (samePage && url.hash) return undefined;
  return url;
}

export function navigate(href: string, { replace = false } = {}) {
  const url = siteUrl(href);
  if (!url) {
    window.location.href = href;
    return;
  }
  window.history[replace ? "replaceState" : "pushState"](null, "", url);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function interceptLinks(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
  if (!siteUrl(anchor.href)) return;
  event.preventDefault();
  navigate(anchor.href);
}
