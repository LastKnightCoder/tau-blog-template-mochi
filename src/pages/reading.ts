import { useEffect, useRef, useState, type RefObject } from "react";

const HEADING_OFFSET_PX = 160;
const DONE_AT = 0.98;

const HEADINGS = "h1, h2, h3, h4, h5, h6";

/**
 * 正文顶层标题对应的 DOM，与 onOutline 回调的顺序一致。
 * 只认顶层块里的标题：引用、提示框里嵌套的标题不进目录；长文分块渲染时块外会多一层包裹，所以按 ed-block 层级判断。
 */
export function headingElements(root: HTMLElement | null): HTMLElement[] {
  const editor = root?.querySelector<HTMLElement>('[data-slate-editor="true"]');
  if (!editor) return [];
  return [...editor.querySelectorAll<HTMLElement>(".ed-block")]
    .filter((block) => !block.parentElement?.closest(".ed-block"))
    .flatMap((block) => {
      const heading = block.querySelector<HTMLElement>(HEADINGS);
      return heading && heading.closest(".ed-block") === block ? [heading] : [];
    });
}

export interface ReadingState {
  /** 0–1，读到正文末尾为 1 */
  progress: number;
  /** 当前所在章节在目录里的序号 */
  active: number;
  /** 读完过一次就保持 true，用于只打一次嗝 */
  finished: boolean;
}

/** 跟踪正文的阅读进度和当前章节；进度按正文区域算，不受页脚高度影响 */
export function useReading(article: RefObject<HTMLElement | null>, headingCount: number): ReadingState {
  const [state, setState] = useState<ReadingState>({ progress: 0, active: 0, finished: false });
  const frame = useRef(0);
  useEffect(() => {
    const measure = () => {
      frame.current = 0;
      const element = article.current;
      if (!element) return;
      const box = element.getBoundingClientRect();
      const total = box.height - window.innerHeight;
      const progress = total <= 0 ? 1 : Math.min(1, Math.max(0, -box.top / total));
      let active = 0;
      headingElements(element).forEach((heading, index) => {
        if (heading.getBoundingClientRect().top < HEADING_OFFSET_PX) active = index;
      });
      setState((previous) => ({ progress, active, finished: previous.finished || progress >= DONE_AT }));
    };
    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [article, headingCount]);
  return state;
}

export function scrollToHeading(root: HTMLElement | null, index: number) {
  headingElements(root)[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
}
