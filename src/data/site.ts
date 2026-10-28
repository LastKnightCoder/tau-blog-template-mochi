import type { SiteData } from "@tau/blog";
import type { SiteSettings } from "./types";

const COLORS = ["sakura", "matcha", "shiro", "kuri"] as const;
const DEFAULT_LINES = ["嘿嘿，好痒～", "今天也要好好写字哦", "要不要读读最新那篇？", "我是麻薯做的，不能吃！", "再戳就要变形啦"];
const MAX_LINES = 12;
const MAX_LINE_LENGTH = 40;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** 站点字段由本模板在 manifest 的 siteFields 中声明，这里兜底异常值，保证页面总能渲染 */
export function readSiteSettings(site: SiteData): SiteSettings {
  const fields = site.fields ?? {};
  const color = text(fields.mascotColor);
  const lines = text(fields.mascotLines)
    .split(/\r?\n/)
    .map((line) => line.trim().slice(0, MAX_LINE_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_LINES);
  return {
    title: site.title,
    basePath: site.basePath,
    description: text(fields.description),
    mascotName: text(fields.mascotName).slice(0, 12) || "团子",
    mascotColor: (COLORS as readonly string[]).includes(color) ? (color as SiteSettings["mascotColor"]) : "sakura",
    mascotLines: lines.length ? lines : DEFAULT_LINES,
    ambient: fields.ambient !== false,
  };
}
