import { cn } from "@mochi/ui";

const line = {
  stroke: "var(--mochi-face)",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 回到顶部的气球：一颗樱花团子形状的纸气球 */
export function Balloon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 110" aria-hidden className={cn("block overflow-visible", className)}>
      <path d="M30 70q-6 16 4 38" fill="none" stroke="var(--mochi-ink-3)" strokeWidth={1.2} />
      <path d="M30 6C15 6 7 19 7 32c0 17 15 30 23 34 8-4 23-17 23-34C53 19 45 6 30 6z" fill="var(--mochi-body-sakura)" {...line} />
      <path d="M17 24q4-8 10-10" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={23} cy={35} rx={2.2} ry={2.8} fill="var(--mochi-face)" />
      <ellipse cx={37} cy={35} rx={2.2} ry={2.8} fill="var(--mochi-face)" />
      <path d="M27.5 41q1.25 1.6 2.5 0q1.25 1.6 2.5 0" fill="none" {...line} strokeWidth={1.2} />
    </svg>
  );
}
