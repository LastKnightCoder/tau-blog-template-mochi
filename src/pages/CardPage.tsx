import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { joinBase } from "@mochi/data/routes";
import type { CardView } from "@mochi/data/types";
import { Chip, cn, toneForTag } from "@mochi/ui";
import { Content } from "@mochi/app/Content";
import { useChrome, usePage, usePageOf } from "@mochi/app/context";
import { longDate, readingMinutes } from "@mochi/app/format";
import { Layout } from "@mochi/app/Layout";

const LINKED_LIMIT = 6;
const MINI_TONES = [
  ["bg-soft-mint", "mochi-washi-mint"],
  ["bg-soft-sky", "mochi-washi-sky"],
  ["bg-soft-pink", ""],
  ["bg-soft-lilac", "mochi-washi-lilac"],
  ["bg-soft-peach", "mochi-washi-peach"],
  ["bg-soft-butter", "mochi-washi-butter"],
];
const MINI_TILTS = [1.5, -1.2, 2, -1.6, 1, -0.8];
const FOLLOW_MS = 500;

/** 用一根流动的红毛线把相关卡片连回当前卡片，把「双链」画出来 */
function useYarn() {
  const stage = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ width: number; height: number; start: [number, number]; lines: string[] }>();

  const draw = useCallback(() => {
    const root = stage.current;
    const from = anchor.current;
    if (!root || !from) return;
    const box = root.getBoundingClientRect();
    const source = from.getBoundingClientRect();
    const x0 = source.right - box.left - 30;
    const y0 = source.top - box.top + 40;
    const lines = [...root.querySelectorAll<HTMLElement>("[data-yarn-end]")].map((end) => {
      const target = end.getBoundingClientRect();
      const x1 = target.left - box.left + 24;
      const y1 = target.top - box.top + 2;
      return `M${x0} ${y0} Q${(x0 + x1) / 2} ${Math.max(y0, y1) + 50} ${x1} ${y1}`;
    });
    setPaths({ width: box.width, height: box.height, start: [x0, y0], lines });
  }, []);

  // 悬停时小便签会动，跟着重画半秒
  const follow = useCallback(() => {
    const until = performance.now() + FOLLOW_MS;
    const tick = (time: number) => {
      draw();
      if (time < until) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [draw]);

  useLayoutEffect(() => {
    draw();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", draw);
      return () => window.removeEventListener("resize", draw);
    }
    const observer = new ResizeObserver(draw);
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, [draw]);

  return { stage, anchor, paths, follow };
}

function LinkedCards({ cards, onMove }: { cards: CardView["linkedCards"]; onMove: () => void }) {
  return (
    <section aria-labelledby="linked-title" className="relative z-[3]">
      <h2 id="linked-title" className="mb-4 font-head text-[18px]">
        🧶 用红线连着的便签
      </h2>
      <ul className="m-0 list-none p-0">
        {cards.slice(0, LINKED_LIMIT).map((card, index) => (
          <li key={card.target.key} className="mb-6">
            <a
              href={card.href}
              data-yarn-end
              onMouseEnter={onMove}
              onMouseLeave={onMove}
              className={cn(
                "relative block rounded-[4px_4px_14px_4px] border-sheet px-3.5 pt-4 pb-2.5 text-[13.5px] text-ink no-underline shadow-sheet transition-[transform,box-shadow] duration-[400ms] ease-spring hover:-translate-x-1.5 hover:scale-[1.03] hover:rotate-0 hover:shadow-sheet-hover",
                MINI_TONES[index % MINI_TONES.length][0],
              )}
              style={{ rotate: `${MINI_TILTS[index % MINI_TILTS.length]}deg` }}
            >
              <span aria-hidden className={cn("mochi-washi absolute -top-2 left-4 h-3.5 w-11 -rotate-[5deg]", MINI_TONES[index % MINI_TONES.length][1])} />
              <span className="line-clamp-3">{card.summary}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 当前卡片是手帐里的一页，和文章页同一种纸；相关卡片贴在右侧，用红毛线连回来 */
export function CardPage() {
  const card = usePageOf("card");
  const { result } = usePage();
  const { site } = useChrome();
  const yarn = useYarn();
  const linked = card.linkedCards;

  return (
    <Layout className="mochi-dots">
      <div ref={yarn.stage} className="relative mx-auto grid max-w-[1040px] grid-cols-[1fr_300px] gap-10 px-10 pt-10 pb-[60px] max-lg:grid-cols-1 max-sm:px-4">
        {yarn.paths && linked.length > 0 && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 z-[2] overflow-visible max-lg:hidden" width={yarn.paths.width} height={yarn.paths.height}>
            {yarn.paths.lines.map((path) => (
              <path key={path} d={path} className="mochi-yarn" />
            ))}
            <circle cx={yarn.paths.start[0]} cy={yarn.paths.start[1]} r={7} fill="var(--mochi-accent)" stroke="var(--mochi-line)" strokeWidth={2.5} />
          </svg>
        )}
        <div>
          <div ref={yarn.anchor} className="mochi-sheet relative -rotate-[.6deg] rounded-[6px_6px_26px_6px] border-sheet bg-paper pt-[46px] pr-11 pb-[34px] pl-[60px] text-[17px] leading-[1.95] text-ink shadow-sheet max-sm:px-6 max-sm:pl-10">
            <span aria-hidden className="mochi-washi mochi-washi-butter absolute -top-3 left-1/2 -ml-[60px] h-7 w-[120px] rotate-2" />
            <p className="mb-3.5 flex flex-wrap items-center gap-2.5 text-[13px] text-ink-2">
              📌 <time dateTime={new Date(card.createTime).toISOString()}>{longDate(card.createTime)}</time> · 约 {readingMinutes(card.content)} 分钟
              {card.tags.map((tag) => (
                <a key={tag} href={`${joinBase(site.basePath, "/cards")}?tag=${encodeURIComponent(tag)}`} className="no-underline">
                  <Chip tone={toneForTag(tag)}>#{tag}</Chip>
                </a>
              ))}
            </p>
            <Content result={result} />
          </div>
          {card.updateTime !== card.createTime && <p className="mt-4 text-[12px] text-ink-2">最后更新于 {longDate(card.updateTime)}</p>}
        </div>
        {linked.length > 0 && <LinkedCards cards={linked} onMove={yarn.follow} />}
      </div>
    </Layout>
  );
}
