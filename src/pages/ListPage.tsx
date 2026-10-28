import { useMemo } from "react";
import type * as Published from "@tau/blog";
import { Mochi } from "@mochi/mochi";
import { joinBase } from "@mochi/data/routes";
import type { Linked, TagNode } from "@mochi/data/types";
import { Candy, Chip, cn, toneForTag } from "@mochi/ui";
import { useChrome, usePage, usePageOf } from "@mochi/app/context";
import { dateParts, shortDate } from "@mochi/app/format";
import { Layout } from "@mochi/app/Layout";
import { navigate, useLocation } from "@mochi/app/navigation";

type Item = Linked<Published.ListItem>;

/** 标签筛选写在地址上，分享链接和前进后退都能还原 */
function useTagFilter(listRoute: string) {
  const { site } = useChrome();
  const { search } = useLocation();
  const active = new URLSearchParams(search).get("tag")?.trim() ?? "";
  const select = (tag: string) => {
    const params = new URLSearchParams(search);
    if (tag) params.set("tag", tag);
    else params.delete("tag");
    const query = params.toString();
    navigate(joinBase(site.basePath, listRoute) + (query ? `?${query}` : ""), { replace: true });
  };
  return { active, select };
}

const matchesTag = (tags: readonly string[], active: string) => !active || tags.some((tag) => tag === active || tag.startsWith(`${active}/`));

function PageHead({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="mb-7">
      <h1 className="text-[34px] font-normal tracking-[0.08em]">{title}</h1>
      <p className="mt-1.5 text-[15px] text-ink-2">{sub}</p>
    </header>
  );
}

function Filters({ tags, active, onSelect }: { tags: Array<{ value: string; label: string; count?: number }>; active: string; onSelect: (tag: string) => void }) {
  if (tags.length <= 1) return null;
  return (
    <div role="group" aria-label="按标签筛选" className="mb-7 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Candy key={tag.value} selected={active === tag.value} onClick={() => onSelect(tag.value)}>
          {tag.label}
          {tag.count !== undefined && <span className="ml-1.5 font-num text-[12.5px] opacity-70">{tag.count}</span>}
        </Candy>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  const { site } = useChrome();
  return (
    <div className="grid place-items-center gap-3 border-0 border-t border-solid border-rule py-16 text-ink-2">
      <Mochi mood="sleepy" size={84} color={site.mascotColor} />
      {text}
    </div>
  );
}

/** 文章：一页目录式的清单，日期在左，标题在中，标签在右 */
function ArticleList({ items }: { items: Item[] }) {
  const { active, select } = useTagFilter("/articles");
  const tags = useMemo(() => [...new Set(items.flatMap((item) => item.tags))], [items]);
  const shown = items.filter((item) => matchesTag(item.tags, active));
  return (
    <div className="mx-auto max-w-[880px] px-14 pt-8 pb-20 max-md:px-6">
      <PageHead title="文章" sub={`写给你的长信，一共 ${items.length} 篇。`} />
      <Filters tags={[{ value: "", label: "全部" }, ...tags.map((tag) => ({ value: tag, label: tag }))]} active={active} onSelect={select} />
      {shown.length === 0 ? (
        <Empty text={active ? `没有带「${active}」标签的文章。` : "还没有文章。"} />
      ) : (
        <ol className="m-0 list-none border-0 border-t border-solid border-rule p-0">
          {shown.map((item) => {
            const { year, month, day } = dateParts(item.createTime);
            return (
              <li key={item.target.key}>
                <a href={item.href} className="group grid grid-cols-[92px_1fr] gap-6 border-0 border-b border-solid border-rule py-7 text-ink no-underline max-sm:grid-cols-1 max-sm:gap-1.5">
                  <time dateTime={new Date(item.createTime).toISOString()} className="pt-1 font-num text-[14px] text-ink-2">
                    {year}.{String(month).padStart(2, "0")}.{String(day).padStart(2, "0")}
                  </time>
                  <div className="min-w-0">
                    <h2 className="text-[22px] leading-[1.45] font-normal tracking-[0.03em] transition-colors duration-200 group-hover:text-sakura-ink">{item.title || item.summary}</h2>
                    {item.title && <p className="mt-2 line-clamp-2 text-[15px] leading-[1.9] text-ink-2">{item.summary}</p>}
                    {item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                        {item.tags.map((tag) => (
                          <Chip key={tag} tone={toneForTag(tag)}>
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/** 标签树铺平成一排筛选：子标签写成「思考 / 学习」 */
function flattenTags(nodes: readonly TagNode[]): Array<{ value: string; label: string; count: number }> {
  return nodes.flatMap((node) => [{ value: node.path, label: node.path.split("/").join(" / "), count: node.count }, ...flattenTags(node.children)]);
}

const DOTS = { sakura: "bg-sakura", matcha: "bg-matcha", kuri: "bg-kuri", azuki: "bg-azuki" } as const;

/** 卡片：一盒和果子，每张卡片是一格，用一像素的细线隔开 */
function CardBox({ items }: { items: Item[] }) {
  const { tagTree } = usePage();
  const { active, select } = useTagFilter("/cards");
  const shown = items.filter((item) => matchesTag(item.tags, active));
  const tags = flattenTags(tagTree);
  return (
    <div className="mx-auto max-w-[1120px] px-14 pt-8 pb-20 max-md:px-6">
      <PageHead title="卡片" sub="一盒随手记下的小想法，按标签挑着看。" />
      <Filters tags={[{ value: "", label: "全部", count: items.length }, ...tags]} active={active} onSelect={select} />
      <p className="sr-only" aria-live="polite">
        {active ? `「${active}」下有 ${shown.length} 张卡片` : `共 ${items.length} 张卡片`}
      </p>
      {shown.length === 0 ? (
        <Empty text="这一格还空着。" />
      ) : (
        <ul key={active} className="m-0 grid list-none grid-cols-3 gap-px overflow-hidden rounded-sm border-hair bg-rule p-0 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {shown.map((item, index) => {
            const tag = item.tags[0];
            return (
              <li key={item.target.key} className="mochi-cell-in" style={{ animationDelay: `${Math.min(index, 8) * 0.03}s` }}>
                <a href={item.href} className="flex h-full min-h-[200px] flex-col gap-3 bg-paper px-6 pt-6 pb-5 text-ink no-underline transition-colors duration-300 ease-soft hover:bg-wash">
                  <i aria-hidden className={cn("size-3.5 rounded-full ring-1 ring-rule-strong", DOTS[tag ? toneForTag(tag) : "kuri"])} />
                  <p className="line-clamp-5 flex-1 text-[15.5px] leading-[1.9]">{item.summary}</p>
                  <footer className="flex justify-between text-[12.5px] text-ink-2">
                    <span>{item.tags.map((value) => value.split("/").pop()).join("、")}</span>
                    <time className="font-num">{shortDate(item.createTime)}</time>
                  </footer>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** 项目：一排小册子的书脊 */
function Library({ items }: { items: Item[] }) {
  return (
    <div className="mx-auto max-w-[880px] px-14 pt-8 pb-20 max-md:px-6">
      <PageHead title="项目" sub={`一本本做完的小册子，一共 ${items.length} 本。`} />
      <ol className="m-0 list-none border-0 border-t border-solid border-rule p-0">
        {items.map((item, index) => (
          <li key={item.target.key}>
            <a href={item.href} className="group grid grid-cols-[48px_1fr] items-baseline gap-5 border-0 border-b border-solid border-rule py-6 text-ink no-underline">
              <span className="font-num text-[14px] text-ink-3">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-[21px] font-normal tracking-[0.04em] transition-colors duration-200 group-hover:text-sakura-ink">{item.title || "未命名项目"}</h2>
                {item.summary && <p className="mt-1.5 line-clamp-2 text-[15px] text-ink-2">{item.summary}</p>}
              </div>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ListPage() {
  const list = usePageOf("list");
  return (
    <Layout>
      {list.type === "article" && <ArticleList items={list.items} />}
      {list.type === "card" && <CardBox items={list.items} />}
      {list.type === "doc" && <Library items={list.items} />}
    </Layout>
  );
}
