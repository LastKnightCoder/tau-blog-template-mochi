import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { SearchHit, SearchMatch } from "@tau/blog";
import { Mochi, type MochiMood } from "@mochi/mochi";
import { joinBase } from "@mochi/data/routes";
import { Candy, cn, Input, Kbd } from "@mochi/ui";
import { useSite } from "./context";
import { navigate } from "./navigation";

const RESULT_LIMIT = 12;
const DEBOUNCE_MS = 120;
type Filter = "all" | SearchHit["type"];

const FILTERS: Array<[Filter, string]> = [
  ["all", "全部"],
  ["article", "文章"],
  ["card", "卡片"],
  ["doc", "文档"],
];
const KIND: Record<SearchHit["type"], { label: string; dot: string }> = {
  article: { label: "文章", dot: "bg-sakura" },
  card: { label: "卡片", dot: "bg-matcha" },
  doc: { label: "文档", dot: "bg-kuri" },
};

/** 按命中区间高亮；区间来自数据客户端，直接用字符位置切分 */
function highlight(match: SearchMatch | undefined, fallback: string): ReactNode {
  if (!match?.ranges.length) return fallback;
  const parts: ReactNode[] = [];
  let cursor = 0;
  match.ranges.forEach(([start, end], index) => {
    parts.push(<Fragment key={`t${index}`}>{match.text.slice(cursor, start)}</Fragment>);
    parts.push(
      <em key={`m${index}`} className="bg-[linear-gradient(transparent_60%,var(--mochi-sakura)_60%)] text-ink not-italic">
        {match.text.slice(start, end)}
      </em>,
    );
    cursor = end;
  });
  parts.push(<Fragment key="rest">{match.text.slice(cursor)}</Fragment>);
  return parts;
}

interface SearchState {
  query: string;
  hits: SearchHit[];
  loading: boolean;
  error: string;
}

function useSearch(query: string): SearchState {
  const { site } = useSite();
  const [state, setState] = useState<SearchState>({ query: "", hits: [], loading: false, error: "" });
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setState({ query: "", hits: [], loading: false, error: "" });
      return;
    }
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    const timer = setTimeout(() => {
      site.client
        .search(trimmed, { limit: RESULT_LIMIT, signal: controller.signal })
        .then((hits) => setState({ query: trimmed, hits, loading: false, error: "" }))
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setState({ query: trimmed, hits: [], loading: false, error: error instanceof Error ? error.message : String(error) });
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, site]);
  return state;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { site } = useSite();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState(0);
  const { hits, loading, error, query: searched } = useSearch(query);
  const shown = hits.filter((hit) => filter === "all" || hit.type === filter).flatMap((hit) => {
    const route = site.routes.routeFor(hit);
    return route === undefined ? [] : [{ hit, href: joinBase(site.manifest.site.basePath, route) }];
  });
  const mood: MochiMood = error ? "dizzy" : searched && !loading && shown.length === 0 ? "dizzy" : query ? "curious" : "happy";

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      setQuery("");
      setSelected(0);
      element.showModal?.();
      requestAnimationFrame(() => input.current?.focus());
    }
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => setSelected(0), [query, filter]);

  const go = (href: string) => {
    onClose();
    navigate(href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!shown.length) return;
      setSelected((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length);
    } else if (event.key === "Enter" && shown[selected]) {
      event.preventDefault();
      go(shown[selected].href);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-label="搜索"
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && onClose()}
      className="mochi-search m-0 mx-auto mt-[12vh] w-[min(620px,calc(100vw-24px))] max-w-none overflow-visible border-0 bg-transparent p-0 text-ink backdrop:bg-[var(--tau-overlay)] backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <div className="mochi-pop relative rounded-lg border-hair bg-paper-hi px-6 pt-5 pb-4 shadow-float">
          <span aria-hidden className="absolute -top-[46px] right-8">
            <Mochi mood={mood} size={58} color={site.chrome().site.mascotColor} />
          </span>
          <Input
            ref={input}
            role="combobox"
            aria-expanded={shown.length > 0}
            aria-controls={listId}
            aria-activedescendant={shown[selected] ? `${listId}-${selected}` : undefined}
            aria-label="搜索文章、卡片和文档"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="团子帮你闻一闻……"
            autoComplete="off"
            leading={
              <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <circle cx={11} cy={11} r={6.5} />
                <path d="M16 16l4 4" />
              </svg>
            }
            trailing={<Kbd>Esc</Kbd>}
          />
          <div role="group" aria-label="按类型筛选" className="mt-4 mb-2 flex gap-1.5">
            {FILTERS.map(([value, label]) => (
              <Candy key={value} selected={filter === value} onClick={() => setFilter(value)}>
                {label}
              </Candy>
            ))}
          </div>
          <div className="-mx-2 max-h-[340px] overflow-auto">
            {error ? (
              <p role="alert" className="py-6 text-center text-ink-2">
                搜索索引没能打开：{error}
              </p>
            ) : shown.length > 0 ? (
              <ul id={listId} role="listbox" className="m-0 list-none p-0">
                {shown.map(({ hit, href }, index) => {
                  const kind = KIND[hit.type];
                  const title = hit.matches?.find((match) => match.field === "title");
                  const summary = hit.matches?.find((match) => match.field !== "title" && match.field !== "tags");
                  return (
                    <li
                      key={hit.key}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === selected}
                      onMouseEnter={() => setSelected(index)}
                      onClick={() => go(href)}
                      className={cn("grid cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-4 rounded-sm px-2 py-2.5", index === selected && "bg-wash")}
                    >
                      <div className="min-w-0">
                        <h3 className="truncate text-[16px] font-normal">{highlight(title, hit.title || hit.summary)}</h3>
                        <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-2">{highlight(summary, hit.summary)}</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
                        <i aria-hidden className={cn("size-1.5 rounded-full", kind.dot)} />
                        {kind.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p role="status" className="py-6 text-center text-ink-2">
                {loading ? "团子在翻找……" : searched ? "没有找到，换个词试试。" : "输入一个词，搜索文章、卡片和文档。"}
              </p>
            )}
          </div>
          <div className="mt-3 flex gap-4 border-t border-solid border-rule pt-3 text-[12px] text-ink-3">
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> 挑选
            </span>
            <span>
              <Kbd>↵</Kbd> 打开
            </span>
            <span>
              <Kbd>Esc</Kbd> 关闭
            </span>
          </div>
        </div>
      )}
    </dialog>
  );
}
