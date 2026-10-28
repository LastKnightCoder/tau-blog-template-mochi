import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export type ChipTone = "sakura" | "matcha" | "kuri" | "azuki";

/** 标签只是一粒色点加文字，色点颜色按名字固定：同一个标签在全站永远同色 */
const DOTS: Record<ChipTone, string> = {
  sakura: "bg-sakura",
  matcha: "bg-matcha",
  kuri: "bg-kuri",
  azuki: "bg-azuki",
};
const TAG_TONES: ChipTone[] = ["sakura", "matcha", "kuri", "azuki"];

export function toneForTag(tag: string): ChipTone {
  let hash = 0;
  for (const char of tag) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  return TAG_TONES[hash % TAG_TONES.length];
}

/** 内容类型的固定颜色：文章 = 樱花、卡片 = 抹茶、文档 = 栗子 */
export const KIND_TONES = { article: "sakura", card: "matcha", doc: "kuri" } as const satisfies Record<string, ChipTone>;

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
}

export function Chip({ tone = "sakura", className, children, ...rest }: ChipProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] text-ink-2", className)} {...rest}>
      <i aria-hidden className={cn("size-2 rounded-full ring-1 ring-rule-strong", DOTS[tone])} />
      {children}
    </span>
  );
}
