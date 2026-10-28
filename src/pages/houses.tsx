import type { ReactNode } from "react";

/**
 * 首页的三栋绘本小屋。每栋只画墙、屋顶和招牌；门留空，由 House 叠一层 HTML，
 * 这样门里能放真正的 <Mochi />（会探头），开门动画也沿用 CSS。
 * 颜色全部取 token，夜晚模式下屋顶变深、窗户亮灯。
 */

const line = {
  stroke: "var(--mochi-line)",
  strokeWidth: 2.5,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};
const thin = { ...line, strokeWidth: 2 };
const shine = { stroke: "#fff", strokeWidth: 5, strokeLinecap: "round" as const, opacity: 0.7, fill: "none" };

export interface Door {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Building {
  width: number;
  height: number;
  door: Door;
  /** 门板颜色 */
  doorTone: string;
  draw: (options: { smoke: boolean }) => ReactNode;
}

const Ground = ({ width, y }: { width: number; y: number }) => <ellipse cx={width / 2} cy={y} rx={width * 0.4} ry={4} fill="var(--mochi-ground)" />;

const Window = ({ x, y, size = 20 }: { x: number; y: number; size?: number }) => (
  <rect x={x} y={y} width={size} height={size * 0.9} rx={4} fill="var(--mochi-glow)" {...line} />
);

/** 邮局：尖屋顶、冒烟的烟囱、阁楼圆窗，门口一个邮筒 */
export const POST_OFFICE: Building = {
  width: 150,
  height: 170,
  door: { x: 60, y: 112, width: 30, height: 46 },
  doorTone: "bg-peach",
  draw: ({ smoke }) => (
    <>
      <Ground width={150} y={162} />
      <rect x={98} y={22} width={16} height={30} fill="var(--mochi-peach)" {...line} />
      {smoke && [0, 1.5].map((delay) => <circle key={delay} className="mochi-smoke" cx={106} cy={14} r={6} fill="var(--mochi-cloud)" stroke="var(--mochi-ink-3)" strokeWidth={2} style={{ animationDelay: `${delay}s` }} />)}
      <path d="M10 76L75 18l65 58z" fill="var(--mochi-pink)" {...line} />
      <path d="M28 64l47-40" {...shine} />
      <path d="M22 72h106v86H22z" fill="var(--mochi-paper)" {...line} />
      <circle cx={75} cy={56} r={10} fill="var(--mochi-glow)" {...line} />
      <path d="M65 56h20M75 46v20" {...thin} />
      <Window x={32} y={92} />
      <Window x={98} y={92} />
      <g transform="translate(124 120)">
        <rect width={18} height={24} rx={8} fill="var(--mochi-accent)" {...line} />
        <rect x={7} y={24} width={4} height={14} fill="var(--mochi-line)" />
        <path d="M4 8h10" {...line} stroke="#fff" />
      </g>
    </>
  ),
};

/** 便签屋：圆顶，窗上贴满歪歪的便签，门边一盆花 */
export const NOTE_SHOP: Building = {
  width: 150,
  height: 170,
  door: { x: 62, y: 114, width: 26, height: 44 },
  doorTone: "bg-mint",
  draw: () => (
    <>
      <Ground width={150} y={162} />
      <path d="M14 80q6-52 61-60q55 8 61 60z" fill="var(--mochi-mint)" {...line} />
      <path d="M34 54q14-22 38-26" {...shine} />
      <path d="M24 76h102v82H24z" fill="var(--mochi-paper)" {...line} />
      <rect x={34} y={88} width={34} height={28} rx={6} fill="var(--mochi-glow)" {...line} />
      <rect x={38} y={84} width={12} height={12} fill="var(--mochi-pink)" {...thin} transform="rotate(-10 44 90)" />
      <rect x={52} y={96} width={12} height={12} fill="var(--mochi-sky)" {...thin} transform="rotate(8 58 102)" />
      <rect x={84} y={88} width={30} height={24} rx={6} fill="var(--mochi-glow)" {...line} />
      <rect x={88} y={84} width={11} height={11} fill="var(--mochi-lilac)" {...thin} transform="rotate(12 93 90)" />
      <path d="M104 132l14-6v28h-14z" fill="var(--mochi-peach)" {...line} />
      <circle cx={111} cy={122} r={5} fill="var(--mochi-pink)" {...thin} />
    </>
  ),
};

/** 图书馆：两层，屋顶挂着书形招牌，一楼窗边摞着书 */
export const LIBRARY: Building = {
  width: 150,
  height: 190,
  door: { x: 60, y: 134, width: 30, height: 44 },
  doorTone: "bg-lilac",
  draw: () => (
    <>
      <Ground width={150} y={182} />
      <path d="M20 54L75 14l55 40z" fill="var(--mochi-lilac)" {...line} />
      <g transform="rotate(-6 75 15)">
        <rect x={58} y={4} width={34} height={22} rx={4} fill="var(--mochi-butter)" {...line} />
        <path d="M75 6v18" {...thin} />
      </g>
      <path d="M28 52h94v54H28z" fill="var(--mochi-paper)" {...line} />
      <circle cx={52} cy={78} r={11} fill="var(--mochi-glow)" {...line} />
      <circle cx={98} cy={78} r={11} fill="var(--mochi-glow)" {...line} />
      <path d="M14 108L75 90l61 18z" fill="var(--mochi-lilac)" {...line} />
      <path d="M22 106h106v72H22z" fill="var(--mochi-paper)" {...line} />
      <g {...thin}>
        <rect x={32} y={122} width={7} height={22} fill="var(--mochi-pink)" />
        <rect x={39} y={118} width={7} height={26} fill="var(--mochi-mint)" />
        <rect x={46} y={124} width={7} height={20} fill="var(--mochi-sky)" />
        <rect x={98} y={120} width={7} height={24} fill="var(--mochi-butter)" />
        <rect x={105} y={124} width={7} height={20} fill="var(--mochi-pink)" />
        <rect x={112} y={118} width={7} height={26} fill="var(--mochi-mint)" />
      </g>
    </>
  ),
};

/** 房子之间的街景：树、花丛、路灯，让三栋房子像在同一条街上 */
export function Tree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 110" aria-hidden className={className}>
      <ellipse cx={35} cy={104} rx={22} ry={3.5} fill="var(--mochi-ground)" />
      <path d="M31 104V70h8v34z" fill="var(--mochi-peach)" {...line} />
      <path d="M35 8c16 0 28 12 28 28 0 6-2 11-5 15 3 3 5 7 5 12 0 10-9 17-20 17H27C16 80 7 73 7 63c0-5 2-9 5-12-3-4-5-9-5-15C7 20 19 8 35 8z" fill="var(--mochi-mint)" {...line} />
      <path d="M20 30q4-10 14-13" {...shine} />
      <circle cx={24} cy={52} r={3} fill="var(--mochi-pink)" {...thin} />
      <circle cx={46} cy={40} r={3} fill="var(--mochi-pink)" {...thin} />
      <circle cx={42} cy={64} r={3} fill="var(--mochi-pink)" {...thin} />
    </svg>
  );
}

export function Bush({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 34" aria-hidden className={className}>
      <ellipse cx={30} cy={31} rx={24} ry={3} fill="var(--mochi-ground)" />
      <path d="M6 30c-4-10 4-18 12-15 2-8 14-10 18-2 8-4 18 2 16 12l-1 5z" fill="var(--mochi-mint)" {...line} />
      <circle cx={20} cy={20} r={3.2} fill="var(--mochi-butter)" {...thin} />
      <circle cx={36} cy={15} r={3.2} fill="var(--mochi-pink)" {...thin} />
      <circle cx={44} cy={23} r={3.2} fill="var(--mochi-butter)" {...thin} />
    </svg>
  );
}

export function Lamp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 120" aria-hidden className={className}>
      <ellipse cx={15} cy={115} rx={10} ry={2.5} fill="var(--mochi-ground)" />
      <path d="M13 114V34h4v80z" fill="var(--mochi-line)" />
      <path d="M8 114h14" {...line} />
      <path d="M5 34h20l-3-16H8z" fill="var(--mochi-glow)" {...line} />
      <path d="M4 18h22l-11-10z" fill="var(--mochi-lilac)" {...line} />
      <circle className="mochi-lamp-glow" cx={15} cy={26} r={18} fill="var(--mochi-glow)" opacity={0} />
    </svg>
  );
}
