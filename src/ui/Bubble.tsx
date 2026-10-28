import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  /** 尾巴朝向：团子在气泡下方时用 bottom */
  tail?: "bottom" | "none";
  /** 尾巴在左侧还是正中：气泡正下方就是说话的团子时用 center */
  tailAlign?: "start" | "center";
}

/** 团子说话用的小纸条；内容变化时读屏会播报 */
export function Bubble({ tail = "bottom", tailAlign = "start", className, ...rest }: BubbleProps) {
  return (
    <div
      role="status"
      className={cn(
        "relative inline-block rounded-md border-hair bg-paper-hi px-3.5 py-1.5 text-[14px] text-ink-2 shadow-float",
        tail === "bottom" &&
          "after:absolute after:-bottom-[5px] after:size-2.5 after:rotate-45 after:border-r after:border-b after:border-solid after:border-rule after:bg-paper-hi after:content-['']",
        tail === "bottom" && (tailAlign === "center" ? "after:left-1/2 after:-ml-[5px]" : "after:left-5"),
        className,
      )}
      {...rest}
    />
  );
}
