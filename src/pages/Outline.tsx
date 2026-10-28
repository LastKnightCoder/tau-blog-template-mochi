import { useLayoutEffect, useRef, useState } from "react";
import type { OutlineHeading } from "@tau/blog";
import { Mochi, type MochiMood } from "@mochi/mochi";
import { cn } from "@mochi/ui";

interface OutlineProps {
  headings: OutlineHeading[];
  active: number;
  progress: number;
  finished: boolean;
  color: "pink" | "mint" | "sky" | "butter";
  onSelect: (index: number) => void;
}

/** 目录：书签团子沿虚线滑到当前章节，下面是团子的「吃饱程度」= 阅读进度 */
export function Outline({ headings, active, progress, finished, color, onSelect }: OutlineProps) {
  const list = useRef<HTMLOListElement>(null);
  const [riderTop, setRiderTop] = useState(0);
  const minLevel = Math.min(...headings.map((heading) => heading.level));
  const percent = Math.round(progress * 100);
  const mood: MochiMood = finished ? "shy" : "curious";

  useLayoutEffect(() => {
    const item = list.current?.children[active] as HTMLElement | undefined;
    if (item) setRiderTop(item.offsetTop - 2);
  }, [active, headings]);

  return (
    <nav aria-label="目录" className="sticky top-5 self-start max-xl:hidden">
      <h2 className="mb-2.5 font-head text-[16px]">📑 目录</h2>
      <div className="relative pl-[22px] before:absolute before:top-1.5 before:bottom-1.5 before:left-2 before:border-l-[length:var(--mochi-stroke)] before:border-dashed before:border-ink-3 before:content-['']">
        <span aria-hidden className="absolute -left-1 transition-[top] duration-500 ease-spring" style={{ top: riderTop }}>
          <Mochi size={26} mood={mood} color={color} blink={false} />
        </span>
        <ol ref={list} className="m-0 list-none p-0">
          {headings.map((heading, index) => (
            <li key={`${index}-${heading.title}`} style={{ paddingLeft: (heading.level - minLevel) * 12 }}>
              <button
                type="button"
                aria-current={index === active ? "location" : undefined}
                onClick={() => onSelect(index)}
                className={cn(
                  "w-full cursor-pointer border-0 bg-transparent py-[5px] text-left font-body text-[14px] text-ink-2 transition-[color,transform] duration-300 ease-spring hover:translate-x-[3px] hover:text-ink",
                  index === active && "font-semibold text-ink",
                )}
              >
                {heading.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-[22px] rounded-md border-sheet bg-paper px-3 py-2.5 text-[13px] text-ink-2 shadow-sheet">
        团子吃饱程度 <span aria-live="polite">{finished ? "100% 吃饱啦" : `${percent}%`}</span>
        <div
          role="progressbar"
          aria-label="阅读进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-1.5 h-3 overflow-hidden rounded-full border-sheet bg-cream"
        >
          <i className="mochi-stripe block h-full transition-[width] duration-200" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </nav>
  );
}
