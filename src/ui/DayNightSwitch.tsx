import { cn } from "./cn";

export interface DayNightSwitchProps {
  mode: "light" | "dark";
  onChange: (mode: "light" | "dark") => void;
  className?: string;
}

/** 日夜开关：太阳滑到右边变成月亮 */
export function DayNightSwitch({ mode, onChange, className }: DayNightSwitchProps) {
  const dark = mode === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="夜晚模式"
      onClick={() => onChange(dark ? "light" : "dark")}
      className={cn(
        "relative h-[34px] w-[66px] shrink-0 cursor-pointer rounded-full border-sticker shadow-lift-s transition-colors duration-500",
        dark ? "bg-night-sky" : "bg-sky",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-[3px] left-[3px] size-6 rounded-full border-2 border-solid border-line transition-[transform,background-color,box-shadow] duration-500 ease-spring",
          dark ? "translate-x-8 bg-moon shadow-[inset_-7px_-2px_0_var(--mochi-moon-shade)]" : "bg-sun",
        )}
      />
    </button>
  );
}
