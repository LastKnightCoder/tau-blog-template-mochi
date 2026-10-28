import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface CandyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** 标签糖果：用于筛选，选中时粉色底并在前面加一朵小花 */
export function Candy({ selected = false, className, children, type = "button", ...rest }: CandyProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-full border-sticker bg-paper px-[13px] pt-[7px] pb-[6px] font-head text-[14px] leading-none text-ink",
        "transition-transform duration-300 ease-spring hover:-translate-y-0.5 hover:rotate-3",
        selected && "bg-pink before:text-accent-ink before:content-['✿']",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
