import { useMemo, useState, type ReactNode } from "react";
import type * as Published from "@tau/blog";
import { Mochi } from "@mochi/mochi";
import { joinBase } from "@mochi/data/routes";
import { buildTagTree, matchesTag } from "@mochi/data/tags";
import type { Linked } from "@mochi/data/types";
import { Button, Chip, cn, toneForTag } from "@mochi/ui";
import { useChrome, usePageOf } from "@mochi/app/context";
import { dateParts, shortDate } from "@mochi/app/format";
import { Layout } from "@mochi/app/Layout";
import { navigate, useLocation } from "@mochi/app/navigation";
import { TagIndex } from "./TagIndex";

type Item = Linked<Published.ListItem>;

/** 一次铺开的条数；再多就分批，标签多、内容多时首屏不卡 */
const BATCH = 40;

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

function PageHead({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="mb-7">
      <h1 className="text-[34px] font-normal tracking-[0.08em]">{title}</h1>
      <p className="mt-1.5 text-[15px] text-ink-2">{sub}</p>
    </header>
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

/** 按时间分段：同一段的内容挂在一个小标题下，长列表滚动时知道自己在哪；分段次序沿用列表原有顺序 */
function groupBy(items: Item[], label: (item: Item) => string) {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const name = label(item);
    const group = groups.get(name);
    if (group) group.push(item);
    else groups.set(name, [item]);
  }
  return [...groups].map(([name, members]) => ({ label: name, items: members }));
}

/** 右栏顶部：当前在看哪个标签、有多少，一键回到全部 */
function FilterBar({ active, count, unit, onClear }: { active: string; count: number; unit: string; onClear: () => void }) {
  return (
    <p aria-live="polite" className="mb-5 flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1 text-[14.5px] text-ink-2">
      {active ? (
        <>
          <Chip tone={toneForTag(active)} className="text-[14.5px] text-ink">
            {active.split("/").join(" / ")}
          </Chip>
          <span>
            {count} {unit}
          </span>
          <button type="button" onClick={onClear} className="cursor-pointer border-0 bg-transparent p-0 font-body text-[14px] text-sakura-ink underline-offset-4 hover:underline">
            看全部
          </button>
        </>
      ) : (
        <span>
          全部 {count} {unit}
        </span>
      )}
    </p>
  );
}

function MoreButton({ left, unit, onMore }: { left: number; unit: string; onMore: () => void }) {
  if (left <= 0) return null;
  return (
    <div className="mt-8 flex justify-center">
      <Button onClick={onMore}>
        再看 {Math.min(left, BATCH)} {unit}
        <span className="font-num text-[13px] text-ink-3">还有 {left}</span>
      </Button>
    </div>
  );
}

/** 列表页骨架：左边标签索引，右边内容；窄屏标签索引收到内容上方 */
function Shelf({ items, unit, route, title, sub, children }: { items: Item[]; unit: string; route: string; title: string; sub: string; children: (shown: Item[], active: string) => ReactNode }) {
  const { active, select } = useTagFilter(route);
  const tree = useMemo(() => buildTagTree(items), [items]);
  // 按时间分段需要先按创建时间从新到旧排
  const matched = useMemo(() => items.filter((item) => matchesTag(item.tags, active)).sort((a, b) => b.createTime - a.createTime), [items, active]);
  const [limit, setLimit] = useState(BATCH);
  const [shownFor, setShownFor] = useState(active);
  if (shownFor !== active) {
    setShownFor(active);
    setLimit(BATCH);
  }
  const shown = matched.slice(0, limit);
  return (
    <div className="mx-auto grid max-w-[1120px] grid-cols-[220px_minmax(0,1fr)] gap-12 px-14 pt-8 pb-20 max-lg:grid-cols-1 max-lg:gap-6 max-md:px-6">
      <div className="col-span-full">
        <PageHead title={title} sub={sub} />
      </div>
      <div className="col-start-1 row-start-2 max-lg:row-start-auto">
        <TagIndex tree={tree} total={items.length} active={active} onSelect={select} />
      </div>
      <section aria-label={`${title}列表`} className="col-start-2 row-start-2 min-w-0 max-lg:col-start-1 max-lg:row-start-auto">
        {tree.length > 0 && <FilterBar active={active} count={matched.length} unit={unit} onClear={() => select("")} />}
        {matched.length === 0 ? <Empty text={active ? `「${active}」下还没有内容。` : `还没有${title}。`} /> : children(shown, active)}
        <MoreButton left={matched.length - shown.length} unit={unit} onMore={() => setLimit((value) => value + BATCH)} />
      </section>
    </div>
  );
}

const TAG_LIMIT = 3;

/** 每条最多露三个标签，其余收成「+N」，悬停可看全部 */
function TagLine({ tags, className }: { tags: readonly string[]; className?: string }) {
  if (tags.length === 0) return null;
  const rest = tags.length - TAG_LIMIT;
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-1", className)} title={rest > 0 ? tags.join("、") : undefined}>
      {tags.slice(0, TAG_LIMIT).map((tag) => (
        <Chip key={tag} tone={toneForTag(tag)}>
          {tag.split("/").pop()}
        </Chip>
      ))}
      {rest > 0 && <span className="font-num text-[13px] text-ink-3">+{rest}</span>}
    </div>
  );
}

/** 文章：按年分段的目录，日期在左，标题与摘要在右 */
function ArticleList({ items }: { items: Item[] }) {
  return (
    <Shelf items={items} unit="篇" route="/articles" title="文章" sub={`写给你的长信，一共 ${items.length} 篇。`}>
      {(shown) =>
        groupBy(shown, (item) => `${dateParts(item.createTime).year}`).map((group) => (
          <section key={group.label} aria-label={`${group.label} 年`} className="mb-6">
            <h2 className="sticky top-0 z-10 bg-paper/90 py-2 font-num text-[15px] font-normal tracking-[0.08em] text-ink-3 backdrop-blur-sm">{group.label}</h2>
            <ol className="m-0 list-none border-0 border-t border-solid border-rule p-0">
              {group.items.map((item) => {
                const { month, day } = dateParts(item.createTime);
                return (
                  <li key={item.target.key}>
                    <a href={item.href} className="group grid grid-cols-[64px_1fr] gap-6 border-0 border-b border-solid border-rule py-6 text-ink no-underline max-sm:grid-cols-1 max-sm:gap-1.5">
                      <time dateTime={new Date(item.createTime).toISOString()} className="pt-1 font-num text-[14px] text-ink-2">
                        {String(month).padStart(2, "0")}.{String(day).padStart(2, "0")}
                      </time>
                      <div className="min-w-0">
                        <h3 className="text-[21px] leading-[1.45] font-normal tracking-[0.03em] transition-colors duration-200 group-hover:text-sakura-ink">{item.title || item.summary}</h3>
                        {item.title && <p className="mt-2 line-clamp-2 text-[15px] leading-[1.9] text-ink-2">{item.summary}</p>}
                        <TagLine tags={item.tags} className="mt-3" />
                      </div>
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      }
    </Shelf>
  );
}

const DOTS = { sakura: "bg-sakura", matcha: "bg-matcha", kuri: "bg-kuri", azuki: "bg-azuki" } as const;

/** 卡片：按月分格的点心盒，每张卡片是一格，用一像素的细线隔开 */
function CardBox({ items }: { items: Item[] }) {
  return (
    <Shelf items={items} unit="张" route="/cards" title="卡片" sub={`一盒随手记下的小想法，一共 ${items.length} 张。`}>
      {(shown, active) =>
        groupBy(shown, (item) => {
          const { year, month } = dateParts(item.createTime);
          return `${year} 年 ${month} 月`;
        }).map((group) => (
          <section key={`${active}:${group.label}`} aria-label={group.label} className="mb-8">
            <h2 className="sticky top-0 z-10 flex items-baseline gap-2 bg-paper/90 py-2 text-[15px] font-normal tracking-[0.08em] text-ink-2 backdrop-blur-sm">
              {group.label}
              <span className="font-num text-[12.5px] text-ink-3">{group.items.length}</span>
            </h2>
            <ul className="m-0 grid list-none grid-cols-2 gap-px overflow-hidden rounded-sm border-hair bg-rule p-0 max-sm:grid-cols-1">
              {group.items.map((item, index) => {
                const tag = item.tags[0];
                return (
                  <li key={item.target.key} className="mochi-cell-in" style={{ animationDelay: `${Math.min(index, 8) * 0.03}s` }}>
                    <a href={item.href} className="flex h-full min-h-[168px] flex-col gap-3 bg-paper px-6 pt-5 pb-4 text-ink no-underline transition-colors duration-300 ease-soft hover:bg-wash">
                      <i aria-hidden className={cn("size-3 rounded-full ring-1 ring-rule-strong", DOTS[tag ? toneForTag(tag) : "kuri"])} />
                      <p className="line-clamp-4 flex-1 text-[15.5px] leading-[1.9]">{item.summary}</p>
                      <footer className="flex items-end justify-between gap-4 text-[12.5px] text-ink-2">
                        <TagLine tags={item.tags} className="min-w-0 [&_span]:text-[12.5px]" />
                        <time className="shrink-0 font-num">{shortDate(item.createTime)}</time>
                      </footer>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      }
    </Shelf>
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
