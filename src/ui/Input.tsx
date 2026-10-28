import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 输入框左侧的图标或文字 */
  leading?: ReactNode;
  /** 输入框右侧，如快捷键提示 */
  trailing?: ReactNode;
}

/** 只有一条底线的输入框，聚焦时底线变成店印色 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ leading, trailing, className, ...rest }, ref) {
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 border-0 border-b border-solid border-rule-strong py-2.5 text-ink-2",
        "transition-colors duration-200 ease-soft focus-within:border-seal focus-within:text-ink",
        className,
      )}
    >
      {leading}
      <input ref={ref} className="min-w-0 flex-1 border-0 bg-transparent font-body text-[17px] text-ink outline-none placeholder:text-ink-3" {...rest} />
      {trailing}
    </label>
  );
});

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-xs border-hair px-1.5 font-mono text-[11px] text-ink-3">{children}</kbd>;
}
