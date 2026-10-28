import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes } from "react";
import { cn } from "./cn";
import type { ChipTone } from "./Chip";

const LIFT_ON_HOVER =
  "transition-[transform,box-shadow] duration-[550ms] ease-spring hover:-translate-y-1.5 hover:shadow-lift-l focus-visible:-translate-y-1.5";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 可点击时悬停上抬 */
  interactive?: boolean;
}

/** 纸面卡片：信纸、弹窗、侧栏面板的底座 */
export function Card({ interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-sticker bg-paper px-[18px] py-4 text-ink shadow-lift",
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
      className={cn("block rounded-lg border-sticker bg-paper px-[18px] py-4 text-ink no-underline shadow-lift", LIFT_ON_HOVER, className)}
      {...rest}
    />
  );
}

const NOTE_TONES: Record<Exclude<ChipTone, "cream">, string> = {
  pink: "bg-pink",
  mint: "bg-mint",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
  peach: "bg-peach",
};

export interface NoteProps extends HTMLAttributes<HTMLDivElement> {
  tone?: keyof typeof NOTE_TONES;
  /** 静止时的倾斜角度（度），悬停时扶正；建议 ±2 以内 */
  tilt?: number;
  /** 顶部图钉 */
  pin?: boolean;
}

/** 钉在软木板上的便签：保留一个直角，像从本子上撕下来的 */
export function Note({ tone = "butter", tilt = -1.6, pin = true, className, style, children, ...rest }: NoteProps) {
  return (
    <div
      className={cn(
        "relative rounded-[4px_4px_18px_4px] border-sticker px-4 pt-[22px] pb-3.5 text-[14.5px] text-ink shadow-lift",
        "rotate-(--note-tilt) transition-transform duration-[550ms] ease-spring hover:-translate-y-1.5 hover:rotate-0",
        NOTE_TONES[tone],
        className,
      )}
      style={{ "--note-tilt": `${tilt}deg`, ...style } as CSSProperties}
      {...rest}
    >
      {pin && (
        <span
          aria-hidden
          className="absolute -top-2.5 left-1/2 -ml-[9px] size-[18px] rounded-full border-sticker bg-accent shadow-[inset_-3px_-3px_0_rgb(0_0_0/0.2)]"
        />
      )}
      {children}
    </div>
  );
}
