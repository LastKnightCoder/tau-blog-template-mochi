import { useMemo } from "react";
import type * as Published from "@tau/blog";
import { Mochi } from "@mochi/mochi";
import { joinBase } from "@mochi/data/routes";
import type { Linked, TagNode } from "@mochi/data/types";
import { Candy, Chip, cn, Note, toneForTag, type ChipTone } from "@mochi/ui";

const TagChip = ({ tag }: { tag: string }) => <Chip tone={toneForTag(tag)}>#{tag}</Chip>;
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

function PageTitle({ title, sub, hat }: { title: string; sub: string; hat?: "post" | "grad" }) {
  const { site } = useChrome();
  return (
    <header className="mb-6">
      <h1 className="flex items-center gap-3.5 font-head text-[40px]">
        <Mochi size={62} hat={hat} color={site.mascotColor} />
        {title}
      </h1>
      <p className="mt-1.5 text-ink-2">{sub}</p>
    </header>
  );
}

const STAMP_TONES = ["bg-soft-peach", "bg-soft-sky", "bg-soft-mint", "bg-soft-lilac", "bg-soft-butter", "bg-soft-pink"];

/** 文章是一封横线信纸：悬停时扶正抬起，一枚带发布日期的邮戳盖上来 */
function Letter({ item, index }: { item: Item; index: number }) {
  const { site } = useChrome();
  const { year, month, day } = dateParts(item.createTime);
  return (
    <a
      href={item.href}
      className={cn(
        "mochi-ruled group relative grid grid-cols-[92px_1fr_96px] items-center gap-[22px] rounded-[18px] border-sheet bg-paper px-[22px] py-5 text-ink no-underline shadow-sheet max-sm:grid-cols-[72px_1fr]",
        "transition-[transform,box-shadow] duration-[450ms] ease-spring hover:-translate-y-1.5 hover:rotate-0 hover:shadow-sheet-hover",
        index % 2 ? "rotate-[.5deg]" : "-rotate-[.6deg]",
      )}
    >
      <div className="rounded-md border-sheet bg-soft-butter py-1.5 text-center leading-[1.1]">
        <b className="block font-latin text-[30px]">{day}</b>
        <span className="text-[12px]">{month} 月</span>
      </div>
      <div className="min-w-0">
        {item.title && <h2 className="mb-1 font-head text-[22px] leading-[1.35]">{item.title}</h2>}
        <p className="line-clamp-2 text-[14.5px] text-ink-2">{item.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      </div>
      <div
        aria-hidden
        className={cn(
          "grid h-24 w-[84px] place-items-center justify-self-end rounded-[8px] border-[length:var(--mochi-stroke)] border-dashed border-line rotate-[4deg] transition-transform duration-[400ms] ease-spring group-hover:-rotate-6 group-hover:scale-105 max-sm:hidden",
          STAMP_TONES[index % STAMP_TONES.length],
        )}
      >
        <Mochi size={52} color={site.mascotColor} blink={false} />
      </div>
      <span
        aria-hidden
        className="mochi-postmark pointer-events-none absolute top-3.5 right-[58px] grid size-[86px] place-items-center rounded-full border-[3px] border-solid border-accent-ink text-center font-head text-[12px] leading-tight text-accent-ink max-sm:hidden"
      >
        MOCHI
        <br />
        {year}·{month}·{day}
      </span>
    </a>
  );
}

function ArticleList({ items, title }: { items: Item[]; title: string }) {
  const { active, select } = useTagFilter("/articles");
  const tags = useMemo(() => [...new Set(items.flatMap((item) => item.tags))], [items]);
  const shown = items.filter((item) => matchesTag(item.tags, active));
  return (
    <div className="mx-auto max-w-[960px] px-10 pt-10 pb-20 max-sm:px-5">
      <PageTitle title={title === "全部文章" || !title ? "邮局" : title} sub={`这里存着我寄出的 ${items.length} 封信。点一下标签糖果，只看某一类。`} hat="post" />
      {tags.length > 0 && (
        <div role="group" aria-label="按标签筛选" className="mb-[26px] flex flex-wrap gap-2">
          <Candy selected={!active} onClick={() => select("")}>
            全部
          </Candy>
          {tags.map((tag) => (
            <Candy key={tag} selected={active === tag} onClick={() => select(tag)}>
              {tag}
            </Candy>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <Empty text={active ? `没有带「${active}」的信。` : "邮局里还没有信。"} />
      ) : (
        <div className="flex flex-col gap-[22px]">
          {shown.map((item, index) => (
            <Letter key={item.target.key} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="grid place-items-center gap-2 py-16 text-ink-2">
      <Mochi mood="sleepy" size={96} />
      {text}
    </div>
  );
}

/** 标签罐子：罐里糖果的高度 = 卡片数占比 */
function Jar({ node, depth, active, max, onSelect }: { node: TagNode; depth: number; active: string; max: number; onSelect: (tag: string) => void }) {
  const fill = Math.max(8, Math.round((node.count / max) * 100));
  const selected = active === node.path;
  return (
    <>
      <li>
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect(selected ? "" : node.path)}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[14px] text-ink transition-colors hover:bg-cream",
            depth > 0 && "pl-[26px] text-[13px]",
            selected && "bg-soft-pink hover:bg-soft-pink",
          )}
        >
          <span aria-hidden className="relative h-[26px] w-[22px] shrink-0 overflow-hidden rounded-[5px_5px_8px_8px] border-2 border-solid border-line bg-cream before:absolute before:inset-x-[-2px] before:-top-px before:h-[5px] before:border-b-2 before:border-solid before:border-line before:bg-peach before:content-['']">
            <i className="absolute inset-x-0 bottom-0 bg-accent transition-[height] duration-[400ms] ease-spring" style={{ height: `${fill}%` }} />
          </span>
          <span className="min-w-0 flex-1 truncate">{node.tag}</span>
          <span className="font-head text-[12px] text-ink-2">{node.count}</span>
        </button>
      </li>
      {node.children.map((child) => (
        <Jar key={child.path} node={child} depth={depth + 1} active={active} max={max} onSelect={onSelect} />
      ))}
    </>
  );
}

const NOTE_TONES: Array<Exclude<ChipTone, "cream">> = ["butter", "sky", "mint", "pink", "peach", "lilac"];
const tilt = (index: number) => [-2, 1.6, -1, 2.2, -1.4, 1][index % 6];

function CardBoard({ items }: { items: Item[] }) {
  const { tagTree } = usePage();
  const { active, select } = useTagFilter("/cards");
  const shown = items.filter((item) => matchesTag(item.tags, active));
  const max = Math.max(1, ...tagTree.map((node) => node.count));
  return (
    <div className="grid grid-cols-[220px_1fr] gap-7 px-9 pt-[30px] pb-[60px] max-md:grid-cols-1 max-sm:px-4">
      {tagTree.length > 0 && (
        <aside className="sticky top-5 self-start rounded-[20px] border-sheet bg-paper p-3.5 shadow-sheet max-md:static">
          <h2 className="mb-2 font-head text-[18px]">🫙 标签罐子</h2>
          <ul className="m-0 list-none p-0">
            <li>
              <button
                type="button"
                aria-pressed={!active}
                onClick={() => select("")}
                className={cn("flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[14px] text-ink hover:bg-cream", !active && "bg-soft-pink hover:bg-soft-pink")}
              >
                全部 <span className="ml-auto font-head text-[12px] text-ink-2">{items.length}</span>
              </button>
            </li>
            {tagTree.map((node) => (
              <Jar key={node.path} node={node} depth={0} active={active} max={max} onSelect={select} />
            ))}
          </ul>
        </aside>
      )}
      <div className={cn(tagTree.length === 0 && "col-span-full")}>
        <h1 className="mb-1.5 flex items-center gap-3 font-head text-[34px]">
          <Mochi size={52} mood="wink" />
          便签屋
        </h1>
        <p className="mb-5 text-ink-2" aria-live="polite">
          {active ? `「${active}」罐子里有 ${shown.length} 张便签` : `墙上钉着 ${items.length} 张便签`}
        </p>
        {shown.length === 0 ? (
          <Empty text="这个罐子空空的。" />
        ) : (
          <ul key={active} className="m-0 list-none columns-[220px_3] gap-[22px] p-0">
            {shown.map((item, index) => (
              <li key={item.target.key} className="mochi-note-in mb-[26px] break-inside-avoid pt-3" style={{ animationDelay: `${index * 0.05}s` }}>
                <a href={item.href} className="block text-ink no-underline">
                  <Note tone={NOTE_TONES[index % NOTE_TONES.length]} tilt={tilt(index)} className="leading-[1.85]">
                    <span className="line-clamp-6">{item.summary}</span>
                    <span className="mt-2.5 flex items-center justify-between text-[12px] opacity-75">
                      <span>{item.tags.map((tag) => `#${tag.split("/").pop()}`).join(" ")}</span>
                      <time>{shortDate(item.createTime)}</time>
                    </span>
                  </Note>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** 项目列表：每个项目是图书馆里的一本书 */
function Library({ items }: { items: Item[] }) {
  return (
    <div className="mx-auto max-w-[960px] px-10 pt-10 pb-20 max-sm:px-5">
      <PageTitle title="图书馆" sub={`书架上有 ${items.length} 本绘本，抽一本翻翻看。`} hat="grad" />
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 p-0">
        {items.map((item, index) => (
          <li key={item.target.key}>
            <a
              href={item.href}
              className="group block overflow-hidden rounded-lg border-sheet bg-paper text-ink no-underline shadow-sheet transition-[transform,box-shadow] duration-[550ms] ease-spring hover:-translate-y-1.5 hover:shadow-sheet-hover"
            >
              <div className={cn("h-24 border-b border-solid border-sheet-line", ["bg-soft-mint", "bg-soft-pink", "bg-soft-sky", "bg-soft-butter", "bg-soft-lilac"][index % 5])} />
              <div className="px-4 py-3">
                <h2 className="font-head text-[19px]">{item.title || "未命名项目"}</h2>
                <p className="mt-1 line-clamp-2 text-[14px] text-ink-2">{item.summary}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ListPage() {
  const list = usePageOf("list");
  return (
    <Layout className={list.type === "card" ? "mochi-dots" : undefined}>
      {list.type === "article" && <ArticleList items={list.items} title={list.title} />}
      {list.type === "card" && <CardBoard items={list.items} />}
      {list.type === "doc" && <Library items={list.items} />}
    </Layout>
  );
}
