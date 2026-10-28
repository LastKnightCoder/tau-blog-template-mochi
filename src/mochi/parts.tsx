import type { ReactNode } from "react";
import type { MochiHat, MochiMood } from "./types";

/** 身体轮廓：所有表情共用，切换表情时团子还是「同一只」 */
export const BODY_PATH = "M14 82C8 50 30 22 60 22s52 28 46 60c-1 7-8 10-46 10S15 89 14 82z";

export interface Stroke {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: "round";
  strokeLinejoin: "round";
}

export const strokeOf = (width: number): Stroke => ({
  stroke: "var(--mochi-face)",
  strokeWidth: width,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

function OpenEye({ cx, cy, big = false }: { cx: number; cy: number; big?: boolean }) {
  const rx = big ? 6.5 : 5.5;
  const ry = big ? 8 : 7;
  return (
    <g className="mochi-eye">
      <ellipse className="mochi-pupil" cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--mochi-face)" />
      <circle cx={cx + (big ? 2.4 : 2)} cy={cy - (big ? 3.4 : 3)} r={2.1} fill="#fff" />
    </g>
  );
}

function DizzyEye({ x, line }: { x: number; line: Stroke }) {
  return (
    <path
      className="mochi-spin"
      d={`M${x} 53m-1 0a1.5 1.5 0 1 1 2.5 1.5a4 4 0 1 1-5-4.5a6.5 6.5 0 1 1 8 6`}
      fill="none"
      {...line}
    />
  );
}

export function Eyes({ mood, line }: { mood: MochiMood; line: Stroke }) {
  switch (mood) {
    case "wink":
      return (
        <>
          <path d="M37 55q7-8 14 0" fill="none" {...line} />
          <OpenEye cx={76} cy={53} />
        </>
      );
    case "curious":
      return (
        <>
          <OpenEye cx={45} cy={52} big />
          <OpenEye cx={77} cy={52} big />
        </>
      );
    case "sleepy":
      return <path d="M36 53q8 6 16 0M68 53q8 6 16 0" fill="none" {...line} />;
    case "dizzy":
      return (
        <>
          <DizzyEye x={44} line={line} />
          <DizzyEye x={76} line={line} />
        </>
      );
    case "shy":
      return <path d="M37 55q7-8 14 0M69 55q7-8 14 0" fill="none" {...line} />;
    default:
      return (
        <>
          <OpenEye cx={44} cy={53} />
          <OpenEye cx={76} cy={53} />
        </>
      );
  }
}

export function Mouth({ mood, line }: { mood: MochiMood; line: Stroke }) {
  switch (mood) {
    case "wink":
      return <path d="M53 63q7 9 14 0z" fill="var(--mochi-blush)" {...line} />;
    case "curious":
      return (
        <g className="mochi-sniff">
          <ellipse cx={60} cy={65} rx={3.4} ry={2.6} fill="var(--mochi-face)" />
        </g>
      );
    case "sleepy":
      return <ellipse cx={60} cy={67} rx={3} ry={3.6} fill="none" {...line} />;
    case "dizzy":
      return <path d="M51 68q3-4 6 0t6 0t6 0" fill="none" {...line} />;
    case "shy":
      return <path d="M56 65q4 3 8 0" fill="none" {...line} />;
    default:
      return <path d="M54 64q3 4 6 0q3 4 6 0" fill="none" {...line} />;
  }
}

export function Cheeks({ mood }: { mood: MochiMood }) {
  const opacity = mood === "shy" ? 0.7 : 0.35;
  return (
    <>
      <ellipse cx={31} cy={66} rx={8} ry={5} fill="var(--mochi-blush)" opacity={opacity} />
      <ellipse cx={89} cy={66} rx={8} ry={5} fill="var(--mochi-blush)" opacity={opacity} />
      {mood === "shy" && (
        <path
          d="M27 68l3-4M31 68l3-4M85 68l3-4M89 68l3-4"
          stroke="var(--mochi-face)"
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.55}
        />
      )}
    </>
  );
}

/** 表情的小道具：画在身体之外，所以不跟随呼吸和招牌动作 */
export function Props({ mood, line }: { mood: MochiMood; line: Stroke }) {
  const thin = { ...line, strokeWidth: 2 };
  switch (mood) {
    case "wink":
      return <path d="M98 34l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="var(--mochi-glow)" {...thin} />;
    case "curious":
      return (
        <text x={90} y={24} fontFamily="Baloo 2, sans-serif" fontWeight={700} fontSize={22} fill="var(--mochi-face)">
          ?
        </text>
      );
    case "sleepy":
      return (
        <>
          <text className="mochi-zz" x={92} y={22} fontSize={16}>
            Z
          </text>
          <text className="mochi-zz" x={102} y={14} fontSize={12}>
            z
          </text>
        </>
      );
    case "dizzy":
      return <path className="mochi-sweat" d="M96 36q4 6 0 9q-4-3 0-9z" fill="#9fd3ff" {...thin} />;
    case "shy":
      return (
        <path
          className="mochi-heart"
          d="M96 30c-3-4-9-1-6 4l6 6 6-6c3-5-3-8-6-4z"
          fill="var(--mochi-blush)"
          {...thin}
        />
      );
    default:
      return null;
  }
}

const HATS: Record<Exclude<MochiHat, "none">, (line: Stroke) => ReactNode> = {
  night: (line) => (
    <>
      <path d="M36 28q16-28 46-8l16 6q-2 6-10 2" fill="#8c7bd8" {...line} />
      <circle cx={99} cy={28} r={5.5} fill="#fff" {...line} />
      <path d="M34 30q26-10 50-6" fill="none" {...line} />
    </>
  ),
  post: (line) => (
    <g transform="rotate(-8 60 18)">
      <path d="M40 24v-10q20-8 40 0v10z" fill="#9cc8f5" {...line} />
      <path d="M34 25h50q-4 6-14 4" fill="#7baee6" {...line} />
      <circle cx={60} cy={16} r={3} fill="var(--mochi-glow)" stroke="var(--mochi-face)" strokeWidth={2} />
    </g>
  ),
  grad: (line) => (
    <g transform="rotate(8 60 16)">
      <path d="M46 22v6q14 6 28 0v-6" fill="#4a3d6e" {...line} />
      <path d="M36 20l24-10 24 10-24 9z" fill="#5b4b8a" {...line} />
      <path d="M82 21v12" {...line} />
      <circle cx={82} cy={35} r={2.5} fill="var(--mochi-glow)" />
    </g>
  ),
  santa: (line) => (
    <>
      <path d="M38 28q14-26 40-10l18 14" fill="#e85a5a" {...line} />
      <circle cx={97} cy={33} r={5.5} fill="#fff" {...line} />
      <path d="M34 30q26-10 52-4" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <path d="M34 30q26-10 52-4" fill="none" {...line} strokeWidth={2} />
    </>
  ),
};

export function Hat({ hat, line }: { hat: MochiHat; line: Stroke }) {
  return hat === "none" ? null : <>{HATS[hat](line)}</>;
}
