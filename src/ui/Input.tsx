import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 输入框左侧的图标或文字 */
  leading?: ReactNode;
  /** 输入框右侧，如快捷键提示 */
  trailing?: ReactNode;
}

/** 聚焦时整个框抬起并亮成纸面色 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leading, trailing, className, ...rest },
  ref,
) {
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 rounded-md border-sticker bg-cream px-3.5 py-[9px] text-ink",
        "transition-[transform,box-shadow,background-color] duration-300 ease-spring",
        "focus-within:-translate-y-0.5 focus-within:bg-paper focus-within:shadow-lift",
        className,
      )}
    >
      {leading}
      <input
        ref={ref}
        className="min-w-0 flex-1 border-0 bg-transparent font-body text-[16px] text-ink outline-none placeholder:text-ink-2"
        {...rest}
      />
      {trailing}
    </label>
  );
});

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-[6px] border-[1.5px] border-solid border-ink-3 bg-cream px-1.5 font-mono text-[11px] text-ink-2">
      {children}
    </kbd>
  );
}
