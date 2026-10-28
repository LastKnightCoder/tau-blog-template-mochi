import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  /** 尾巴朝向：团子在气泡下方时用 bottom */
  tail?: "bottom" | "none";
}

/** 团子说话用的气泡；内容变化时读屏会播报 */
export function Bubble({ tail = "bottom", className, ...rest }: BubbleProps) {
  return (
    <div
      role="status"
      className={cn(
        "relative inline-block rounded-[18px] border-sticker bg-paper px-3.5 py-2 text-[15px] text-ink shadow-lift-s",
        tail === "bottom" &&
          "after:absolute after:-bottom-[9px] after:left-6 after:size-3.5 after:rotate-45 after:border-solid after:border-line after:border-t-0 after:border-l-0 after:border-r-[length:var(--mochi-stroke)] after:border-b-[length:var(--mochi-stroke)] after:bg-paper after:content-['']",
        className,
      )}
      {...rest}
    />
  );
}
