import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "default" | "primary" | "quiet";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "border-hair bg-transparent text-ink hover:border-ink-3",
  primary: "border border-solid border-seal bg-seal text-on-seal hover:brightness-95",
  quiet: "border border-solid border-transparent bg-transparent text-ink-2 hover:text-ink hover:bg-wash",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** 只有图标时传入，按钮变为圆形；必须同时提供 aria-label */
  icon?: ReactNode;
}

/** 安静的胶囊按钮：细线、无投影，悬停只换线色 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", icon, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-body text-[15px] leading-none",
        "transition-[color,background-color,border-color,filter] duration-200 ease-soft active:translate-y-px",
        "disabled:pointer-events-none disabled:opacity-45",
        icon && !children ? "size-9 p-0" : "px-[18px] py-2.5",
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
