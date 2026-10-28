/**
 * 三个分区的小插画：像店里的手绘标签，细墨线 + 一块和果子色。
 * 颜色全部取 token，夜晚模式自动换色。
 */
const line = {
  stroke: "var(--mochi-ink)",
  strokeWidth: 1.6,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

export function LetterIcon() {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className="block w-full">
      <rect x={8} y={16} width={44} height={32} rx={3} fill="var(--mochi-sakura)" {...line} />
      <path d="M8 18l22 16 22-16" fill="none" {...line} />
      <circle cx={46} cy={16} r={7} fill="var(--mochi-seal)" />
      <path d="M43 16h6" stroke="var(--mochi-on-seal)" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function CardIcon() {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className="block w-full">
      <rect x={12} y={10} width={34} height={40} rx={3} fill="var(--mochi-paper-hi)" {...line} transform="rotate(-6 29 30)" />
      <g transform="rotate(5 33 32)">
        <rect x={16} y={12} width={34} height={40} rx={3} fill="var(--mochi-matcha)" {...line} />
        <path d="M23 26h18M23 33h14" {...line} strokeWidth={1.4} />
      </g>
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className="block w-full">
      <path d="M8 14q11-4 22 2v32q-11-6-22-2z" fill="var(--mochi-paper-hi)" {...line} />
      <path d="M52 14q-11-4-22 2v32q11-6 22-2z" fill="var(--mochi-kuri)" {...line} />
      <path d="M14 24h10M14 30h10M36 24h10" {...line} strokeWidth={1.3} />
    </svg>
  );
}
