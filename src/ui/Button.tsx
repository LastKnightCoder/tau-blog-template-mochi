import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "default" | "primary" | "accent" | "ghost";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "bg-paper text-ink",
  primary: "bg-butter text-ink",
  accent: "bg-accent-ink text-on-accent",
  ghost: "bg-transparent text-ink shadow-none border-sticker-dashed hover:bg-paper hover:shadow-none",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** 只有图标时传入，按钮变为正方形；必须同时提供 aria-label */
  icon?: ReactNode;
}

/** 贴纸按钮：悬停上抬并歪 2°，按下时投影归零，像把贴纸按进纸里 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", icon, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-sticker font-head text-[16px] leading-none shadow-lift-s",
        "transition-[transform,box-shadow,background-color] duration-300 ease-spring",
        "hover:-translate-y-[3px] hover:-rotate-2 hover:shadow-[0_5px_0_var(--mochi-shadow-color)]",
        "active:translate-y-[2px] active:rotate-0 active:shadow-none",
        "disabled:pointer-events-none disabled:opacity-50",
        icon && !children ? "size-[42px] p-0" : "px-5 pt-[11px] pb-[10px]",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});
