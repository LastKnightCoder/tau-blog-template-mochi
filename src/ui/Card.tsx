import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes } from "react";
import { cn } from "./cn";
import type { ChipTone } from "./Chip";

const LIFT_ON_HOVER =
  "transition-[transform,box-shadow] duration-[550ms] ease-spring hover:-translate-y-1.5 hover:shadow-sheet-hover focus-visible:-translate-y-1.5";
const SHEET = "rounded-lg border-sheet bg-paper px-[18px] py-4 text-ink shadow-sheet";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 可点击时悬停上抬 */
  interactive?: boolean;
}

/** 纸面卡片：信纸、弹窗、侧栏面板的底座 */
export function Card({ interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        SHEET,
        interactive && cn("cursor-pointer", LIFT_ON_HOVER),
        className,
      )}
      {...rest}
    />
  );
}

/** 可点击的整张卡片，渲染为链接 */
export function CardLink({ className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn("block no-underline", SHEET, LIFT_ON_HOVER, className)}
      {...rest}
    />
  );
}

/** 便签纸用淡色组，同色的和纸胶带把它贴在纸上 */
const NOTE_TONES: Record<Exclude<ChipTone, "cream">, { paper: string; tape: string }> = {
  pink: { paper: "bg-soft-pink", tape: "" },
  mint: { paper: "bg-soft-mint", tape: "mochi-washi-mint" },
  butter: { paper: "bg-soft-butter", tape: "mochi-washi-butter" },
  sky: { paper: "bg-soft-sky", tape: "mochi-washi-sky" },
  lilac: { paper: "bg-soft-lilac", tape: "mochi-washi-lilac" },
  peach: { paper: "bg-soft-peach", tape: "mochi-washi-peach" },
};

export interface NoteProps extends HTMLAttributes<HTMLDivElement> {
  tone?: keyof typeof NOTE_TONES;
  /** 静止时的倾斜角度（度），悬停时扶正；建议 ±2 以内 */
  tilt?: number;
  /** 顶部的和纸胶带 */
  tape?: boolean;
}

/** 贴在手帐上的便签：保留一个直角，像从本子上撕下来的 */
export function Note({ tone = "butter", tilt = -1.6, tape = true, className, style, children, ...rest }: NoteProps) {
  const colors = NOTE_TONES[tone];
  return (
    <div
      className={cn(
        "relative rounded-[4px_4px_18px_4px] border-sheet px-4 pt-[22px] pb-3.5 text-[14.5px] text-ink shadow-sheet",
        "rotate-(--note-tilt) transition-[transform,box-shadow] duration-[550ms] ease-spring hover:-translate-y-1.5 hover:rotate-0 hover:shadow-sheet-hover",
        colors.paper,
        className,
      )}
      style={{ "--note-tilt": `${tilt}deg`, ...style } as CSSProperties}
      {...rest}
    >
      {tape && <span aria-hidden className={cn("mochi-washi absolute -top-2.5 left-1/2 -ml-[30px] h-[18px] w-[60px] -rotate-[4deg]", colors.tape)} />}
      {children}
    </div>
  );
}
