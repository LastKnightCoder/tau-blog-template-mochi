import type { DocView, SidebarNode } from "@mochi/data/types";
import { cn } from "@mochi/ui";
import { Content } from "@mochi/app/Content";
import { usePage, usePageOf } from "@mochi/app/context";
import { Layout } from "@mochi/app/Layout";

/** 当前页之前出现过的文档算「读过」，目录里用一粒抹茶色点标出 */
function flatten(nodes: readonly SidebarNode[]): SidebarNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}

function Tree({ nodes, current, visited, depth = 0 }: { nodes: readonly SidebarNode[]; current: string; visited: Set<string>; depth?: number }) {
  return (
    <ul className="m-0 list-none p-0">
      {nodes.map((node, index) => {
        const here = node.href === current;
        const done = node.href !== undefined && visited.has(node.href);
        return (
          <li key={`${index}-${node.title}`}>
            {node.href ? (
              <a
                href={node.href}
                aria-current={here ? "page" : undefined}
                className={cn(
                  "-ml-px flex items-center gap-2 border-0 border-l border-solid border-transparent py-[5px] pr-1 text-[14px] text-ink-2 no-underline transition-colors duration-200 hover:text-ink",
                  here && "border-seal text-ink",
                )}
                style={{ paddingLeft: 14 + depth * 12 }}
              >
                {node.title}
                {done && <i aria-label="读过" className="size-1.5 shrink-0 rounded-full bg-matcha" />}
              </a>
            ) : (
              <span className="block pt-4 pb-1 text-[12.5px] tracking-[0.1em] text-ink-3" style={{ paddingLeft: 14 + depth * 12 }}>
                {node.title}
              </span>
            )}
            {node.children && <Tree nodes={node.children} current={current} visited={visited} depth={depth + 1} />}
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
    <a href={page.href} rel={direction} className={cn("group block py-5 text-ink no-underline", next && "text-right")}>
      <small className="text-[13px] text-ink-3">{next ? "下一页" : "上一页"}</small>
      <div className="mt-1 text-[18px] transition-colors duration-200 group-hover:text-sakura-ink">{page.title}</div>
    </a>
  );
}

/** 项目文档：一本小册子，左边细线目录，正文和文章同一套排版 */
export function DocPage() {
  const doc = usePageOf("doc");
  const { result, sidebar = [], collections } = usePage();
  const book = collections.flatMap((collection) => collection.items).find((item) => item.active);
  const all = flatten(sidebar).filter((node) => node.href);
  const position = all.findIndex((node) => node.href === doc.currentPath);
  const visited = new Set(all.slice(0, Math.max(0, position)).map((node) => node.href!));
  const crumbs = doc.breadcrumb.map((item) => item.label);
  const chapter = crumbs.length > 1 ? crumbs[crumbs.length - 2] : book?.title;

  return (
    <Layout>
      <div className="mx-auto grid max-w-[1120px] grid-cols-[220px_minmax(0,660px)] justify-center gap-16 px-14 pt-8 pb-24 max-lg:grid-cols-[minmax(0,680px)] max-lg:gap-10 max-md:px-6">
        {sidebar.length > 0 && (
          <nav aria-label="文档目录" className="sticky top-6 self-start max-lg:static">
            <h2 className="mb-2 text-[16px] font-normal tracking-[0.06em]">{book?.title ?? "目录"}</h2>
            <div className="border-0 border-l border-solid border-rule">
              <Tree nodes={sidebar} current={doc.currentPath} visited={visited} />
            </div>
          </nav>
        )}
        <article className={cn("min-w-0", sidebar.length === 0 && "col-span-full")}>
          {chapter && <p className="mb-2 text-[14px] tracking-[0.08em] text-sakura-ink">{chapter}</p>}
          <h1 className="mb-10 text-[36px] leading-[1.35] font-normal tracking-[0.04em] max-sm:text-[28px]">{doc.title}</h1>
          <Content result={result} />
          {(doc.prevPage || doc.nextPage) && (
            <nav aria-label="翻页" className="mt-14 grid grid-cols-2 gap-6 border-0 border-t border-solid border-rule max-sm:grid-cols-1">
              <PageTurn page={doc.prevPage} direction="prev" />
              <PageTurn page={doc.nextPage} direction="next" />
            </nav>
          )}
        </article>
      </div>
    </Layout>
  );
}
