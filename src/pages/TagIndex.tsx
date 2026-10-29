import { useMemo, useState } from "react";
import type { TagNode } from "@mochi/data/types";
import { ancestorsOf, flattenTags } from "@mochi/data/tags";
import { cn, Input, toneForTag } from "@mochi/ui";

interface TagIndexProps {
  tree: TagNode[];
  total: number;
  active: string;
  onSelect: (tag: string) => void;
}

const DOTS = { sakura: "bg-sakura", matcha: "bg-matcha", kuri: "bg-kuri", azuki: "bg-azuki" } as const;

const row =
  "flex w-full cursor-pointer items-center gap-2 rounded-sm border-0 bg-transparent py-[5px] pr-2 text-left font-body text-[14px] text-ink-2 transition-colors duration-150 ease-soft hover:bg-wash hover:text-ink";

function Count({ value }: { value: number }) {
  return <span className="ml-auto shrink-0 pl-2 font-num text-[12.5px] text-ink-3">{value}</span>;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 10 10" width={10} height={10} aria-hidden className={cn("transition-transform duration-200 ease-soft", open && "rotate-90")}>
      <path d="M3.5 2l3 3-3 3" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagRow({ node, depth, active, onSelect, label = node.tag }: { node: TagNode; depth: number; active: string; onSelect: (tag: string) => void; label?: string }) {
  const selected = node.path === active;
  return (
    <button
      type="button"
      aria-pressed={selected}
      title={node.path}
      onClick={() => onSelect(selected ? "" : node.path)}
      className={cn(row, selected && "bg-tint-sakura text-ink hover:bg-tint-sakura")}
      style={{ paddingLeft: 8 + depth * 14 }}
    >
      <i aria-hidden className={cn("size-2 shrink-0 rounded-full ring-1 ring-rule-strong", DOTS[toneForTag(node.path)])} />
      <span className="min-w-0 truncate">{label}</span>
      <Count value={node.count} />
    </button>
  );
}

function Branch({ nodes, depth, active, open, onToggle, onSelect }: { nodes: TagNode[]; depth: number; active: string; open: Set<string>; onToggle: (path: string) => void; onSelect: (tag: string) => void }) {
  return (
    <ul className="m-0 list-none p-0">
      {nodes.map((node) => {
        const expanded = open.has(node.path);
        return (
          <li key={node.path} className="relative">
            <TagRow node={node} depth={depth} active={active} onSelect={onSelect} />
            {node.children.length > 0 && (
              <>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "收起" : "展开"}「${node.tag}」的子标签`}
                  onClick={() => onToggle(node.path)}
                  className="absolute top-[3px] grid size-6 cursor-pointer place-items-center rounded-sm border-0 bg-transparent p-0 text-ink-3 hover:text-ink"
                  style={{ left: depth * 14 - 18 }}
                >
                  <Chevron open={expanded} />
                </button>
                {expanded && <Branch nodes={node.children} depth={depth + 1} active={active} open={open} onToggle={onToggle} onSelect={onSelect} />}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 标签索引：一棵可折叠的细线标签树，标签再多也只占侧栏自己的滚动区；输入文字时改为按路径过滤的平铺列表。
 * 窄屏收成一行「按标签看」，点开才展开。
 */
export function TagIndex({ tree, total, active, onSelect }: TagIndexProps) {
  const [query, setQuery] = useState("");
  const [folded, setFolded] = useState(true);
  const [open, setOpen] = useState<Set<string>>(() => new Set(active ? [...ancestorsOf(active), active] : []));
  const all = useMemo(() => flattenTags(tree), [tree]);
  const keyword = query.trim().toLowerCase();
  const hits = keyword ? all.filter((node) => node.path.toLowerCase().includes(keyword)) : [];

  const select = (tag: string) => {
    onSelect(tag);
    setFolded(true);
    if (tag) setOpen((current) => new Set([...current, ...ancestorsOf(tag), tag]));
  };
  const toggle = (path: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(path)) next.add(path);
      return next;
    });

  if (all.length === 0) return null;
  return (
    <nav aria-label="按标签筛选" className="sticky top-6 self-start max-lg:static">
      <button
        type="button"
        aria-expanded={!folded}
        onClick={() => setFolded((value) => !value)}
        className="hidden w-full cursor-pointer items-center gap-2 border-0 border-y border-solid border-rule bg-transparent px-1 py-3 text-left font-body text-[15px] text-ink max-lg:flex"
      >
        按标签看
        <span className="min-w-0 truncate text-ink-2">· {active ? active.split("/").join(" / ") : "全部"}</span>
        <span className="ml-auto text-ink-3">
          <Chevron open={!folded} />
        </span>
      </button>
      <div className={cn("flex max-h-[calc(100dvh-48px)] flex-col max-lg:mt-2 max-lg:max-h-[60vh]", folded && "max-lg:hidden")}>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`在 ${all.length} 个标签里找`} aria-label="找标签" className="mb-3 py-2 [&_input]:text-[14.5px]" />
        <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2 pl-[18px] [scrollbar-width:thin]">
          {keyword ? (
            hits.length === 0 ? (
              <p className="py-2 text-[14px] text-ink-3">没有叫这个的标签。</p>
            ) : (
              <ul className="m-0 list-none p-0">
                {hits.map((node) => (
                  <li key={node.path}>
                    <TagRow node={node} depth={0} active={active} onSelect={select} label={node.path.split("/").join(" / ")} />
                  </li>
                ))}
              </ul>
            )
          ) : (
            <>
              <button type="button" aria-pressed={!active} onClick={() => select("")} className={cn(row, "pl-2", !active && "bg-tint-sakura text-ink hover:bg-tint-sakura")}>
                全部
                <Count value={total} />
              </button>
              <Branch nodes={tree} depth={0} active={active} open={open} onToggle={toggle} onSelect={select} />
            </>
          )}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {keyword ? `找到 ${hits.length} 个标签` : ""}
      </p>
    </nav>
  );
}
