import { cn } from "@mochi/ui";

const line = {
  stroke: "var(--mochi-face)",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 页脚草地上的小蜗牛 */
export function Snail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 44" aria-hidden className={cn("block overflow-visible", className)}>
      <path d="M4 40h50q8 0 10-8l2-14" fill="var(--mochi-body-butter)" {...line} />
      <circle cx={30} cy={24} r={16} fill="var(--mochi-peach)" {...line} />
      <path d="M30 24m-6 0a6 6 0 1 0 6-6a10 10 0 1 1-10 10" fill="none" {...line} />
      <path d="M62 18l-2-12M66 18l4-11" {...line} />
      <circle cx={60} cy={5} r={2.5} fill="var(--mochi-face)" />
      <circle cx={70} cy={6} r={2.5} fill="var(--mochi-face)" />
    </svg>
  );
}

/** 回到顶部的气球 */
export function Balloon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 110" aria-hidden className={cn("block overflow-visible", className)}>
      <path d="M30 70q-6 16 4 38" fill="none" stroke="var(--mochi-face)" strokeWidth={2.5} />
      <path d="M30 4C14 4 6 18 6 32c0 18 16 32 24 36 8-4 24-18 24-36C54 18 46 4 30 4z" fill="var(--mochi-body-pink)" {...line} />
      <path d="M26 68l4 6 4-6z" fill="var(--mochi-body-pink)" {...line} />
      <path d="M16 22q4-8 10-10" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      <path d="M22 34v2M38 34v2" {...line} />
      <path d="M27 42q3 3 6 0" fill="none" {...line} />
    </svg>
  );
}

/** 首页天上飘的云 */
export function Cloud({ width, top, duration, delay }: { width: number; top: number; duration: number; delay: number }) {
  return (
    <svg
      viewBox="0 0 120 50"
      aria-hidden
      className="mochi-drift pointer-events-none absolute left-0 overflow-visible"
      style={{ width, top, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      <path d="M18 46h86a14 14 0 0 0 0-28 22 22 0 0 0-40-8 18 18 0 0 0-32 10A14 14 0 0 0 18 46z" fill="var(--mochi-cloud)" {...line} />
    </svg>
  );
}
