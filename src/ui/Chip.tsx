import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export type ChipTone = "pink" | "mint" | "butter" | "sky" | "lilac" | "peach" | "cream";

const TONES: Record<ChipTone, string> = {
  pink: "bg-pink",
  mint: "bg-mint",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
  peach: "bg-peach",
  cream: "bg-cream",
};

/** 标签按名字落到 6 种马卡龙色之一：同一个标签在全站永远同色 */
const TAG_TONES: ChipTone[] = ["pink", "mint", "butter", "sky", "lilac", "peach"];

export function toneForTag(tag: string): ChipTone {
  let hash = 0;
  for (const char of tag) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  return TAG_TONES[hash % TAG_TONES.length];
}

/** 内容类型的固定颜色：文章 = 粉、卡片 = 薄荷、文档 = 丁香 */
export const KIND_TONES = { article: "pink", card: "mint", doc: "lilac" } as const satisfies Record<string, ChipTone>;

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
}

export function Chip({ tone = "cream", className, ...rest }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border-2 border-solid border-line px-[9px] font-head text-[12px] leading-[1.7] text-ink",
        TONES[tone],
        className,
      )}
      {...rest}
    />
  );
}
