import { Mochi } from "@mochi/mochi";
import type { DocView, SidebarNode } from "@mochi/data/types";
import { cn } from "@mochi/ui";
import { Content } from "@mochi/app/Content";
import { useChrome, usePage, usePageOf } from "@mochi/app/context";
import { Layout } from "@mochi/app/Layout";

/** 当前页之前出现过的文档算「读过」，画成绿色脚印 */
function flatten(nodes: readonly SidebarNode[]): SidebarNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}

function Trail({ nodes, current, visited, depth = 0 }: { nodes: readonly SidebarNode[]; current: string; visited: Set<string>; depth?: number }) {
  const { site } = useChrome();
  return (
    <ul className={cn("m-0 list-none p-0", depth === 0 && "relative before:absolute before:top-4 before:bottom-4 before:left-4 before:border-l-[3px] before:border-dotted before:border-ink-3 before:content-['']")}>
      {nodes.map((node, index) => {
        const here = node.href === current;
        const done = node.href !== undefined && visited.has(node.href);
        const dot = cn(
          "absolute top-3 left-[9px] z-[1] size-3.5 rounded-full border-sticker bg-paper",
          done && "bg-mint",
          here && "bg-accent shadow-[0_0_0_4px_var(--mochi-pink)]",
          !node.href && "top-[13px] h-3 w-4 rounded-[4px] bg-butter",
        );
        return (
          <li key={`${index}-${node.title}`} className="relative">
            <span aria-hidden className={dot} style={{ marginLeft: depth * 12 }} />
            {here && (
              <span aria-hidden className="absolute -top-1 -left-2 z-[2]" style={{ marginLeft: depth * 12 }}>
                <Mochi size={30} color={site.mascotColor} blink={false} />
              </span>
            )}
            {node.href ? (
              <a
                href={node.href}
                aria-current={here ? "page" : undefined}
                className={cn("block py-1.5 pl-[34px] text-[14px] text-ink no-underline hover:text-accent-ink", here && "font-semibold")}
                style={{ marginLeft: depth * 12 }}
              >
                {node.title}
              </a>
            ) : (
              <span className="block py-1.5 pl-[34px] font-head text-[14px] text-ink-2" style={{ marginLeft: depth * 12 }}>
                {node.title}
              </span>
            )}
            {node.children && <Trail nodes={node.children} current={current} visited={visited} depth={depth + 1} />}
          </li>
        );
      })}
    </ul>
  );
}

function PageTurn({ page, direction }: { page?: DocView["prevPage"]; direction: "prev" | "next" }) {
  if (!page) return <span />;
  const next = direction === "next";
  return (
    <a
      href={page.href}
      rel={direction}
      className={cn(
        "group relative overflow-hidden rounded-[18px] border-sheet bg-cream px-4 py-3 text-ink no-underline transition-[transform,background-color] duration-[350ms] ease-spring hover:-translate-y-[3px] hover:bg-soft-butter",
        next && "text-right",
      )}
    >
      <small className="text-[12px] text-ink-2">{next ? "下一页 →" : "← 上一页"}</small>
      <div className="font-head text-[17px]">{page.title}</div>
      {next && (
        <span aria-hidden className="absolute right-0 bottom-0 size-0 rounded-tl-[10px] bg-[linear-gradient(135deg,var(--mochi-soft-butter)_50%,var(--mochi-sheet-line)_50%)] transition-[width,height] duration-300 ease-spring group-hover:size-7" />
      )}
    </a>
  );
}

/** 项目文档是一本绘本：侧栏是一条寻宝小路，正文是一页一页翻的书 */
export function DocPage() {
  const doc = usePageOf("doc");
  const { result, sidebar = [], collections } = usePage();
  const { site } = useChrome();
  const book = collections.flatMap((collection) => collection.items).find((item) => item.active);
  const all = flatten(sidebar).filter((node) => node.href);
  const position = all.findIndex((node) => node.href === doc.currentPath);
  const visited = new Set(all.slice(0, Math.max(0, position)).map((node) => node.href!));
  const crumbs = doc.breadcrumb.map((item) => item.label);
  const chapter = crumbs.length > 1 ? crumbs[crumbs.length - 2] : book?.title;

  return (
    <Layout>
      <div className="mx-auto grid max-w-[1160px] grid-cols-[250px_1fr] gap-[30px] px-9 pt-7 pb-[60px] max-lg:grid-cols-1 max-sm:px-3">
        {sidebar.length > 0 && (
          <nav aria-label="文档目录" className="sticky top-5 self-start rounded-[22px] border-sheet bg-paper px-3.5 py-4 shadow-sheet max-lg:static">
            <h2 className="mb-1.5 flex items-center gap-1.5 font-head text-[18px]">🗺️ {book?.title ?? "目录"}</h2>
            {crumbs.length > 0 && <p className="mb-3 text-[12px] text-ink-2">{["图书馆", ...crumbs].join(" › ")}</p>}
            <Trail nodes={sidebar} current={doc.currentPath} visited={visited} />
          </nav>
        )}
        <article className={cn("overflow-hidden rounded-[26px] border-sheet bg-paper shadow-sheet", sidebar.length === 0 && "col-span-full")}>
          <header className="relative overflow-hidden mochi-cover border-b border-solid border-sheet-line px-10 pt-[26px] pb-[22px] max-sm:px-6">
            {chapter && <p className="text-[13px] text-ink-2">{chapter}</p>}
            <h1 className="font-head text-[34px] leading-[1.3]">{doc.title}</h1>
            <span aria-hidden className="absolute right-10 -bottom-[26px] -rotate-[8deg] max-sm:hidden">
              <Mochi size={110} hat="grad" color={site.mascotColor} />
            </span>
          </header>
          <div className="px-10 pt-[30px] pb-2.5 max-sm:px-6">
            <Content result={result} />
          </div>
          {(doc.prevPage || doc.nextPage) && (
            <nav aria-label="翻页" className="grid grid-cols-2 gap-4 px-10 pt-2.5 pb-[34px] max-sm:grid-cols-1 max-sm:px-6">
              <PageTurn page={doc.prevPage} direction="prev" />
              <PageTurn page={doc.nextPage} direction="next" />
            </nav>
          )}
        </article>
      </div>
    </Layout>
  );
}
