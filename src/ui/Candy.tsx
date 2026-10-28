import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface CandyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** 筛选用的小胶囊：选中时墨底反白 */
export function Candy({ selected = false, className, children, type = "button", ...rest }: CandyProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-full border-hair bg-transparent px-3.5 py-1 font-body text-[14px] text-ink-2",
        "transition-[color,background-color,border-color] duration-200 ease-soft hover:border-ink-3 hover:text-ink",
        selected && "border-ink bg-ink text-paper hover:border-ink hover:text-paper",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
