import { cn } from "./cn";

export interface DayNightSwitchProps {
  mode: "light" | "dark";
  onChange: (mode: "light" | "dark") => void;
  className?: string;
}

const SUN = "M12 4.5v1.8M12 17.7v1.8M4.5 12h1.8M17.7 12h1.8M6.7 6.7l1.3 1.3M16 16l1.3 1.3M6.7 17.3 8 16M16 8l1.3-1.3";

/** 日夜开关：一个圆形细线按钮，白天画太阳，夜晚画月牙 */
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
        "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-hair bg-transparent text-ink-2 transition-colors duration-200 ease-soft hover:border-ink-3 hover:text-ink",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
        {dark ? (
          <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />
        ) : (
          <>
            <circle cx={12} cy={12} r={3.6} />
            <path d={SUN} />
          </>
        )}
      </svg>
    </button>
  );
}
