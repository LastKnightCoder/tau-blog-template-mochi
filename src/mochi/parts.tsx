import type { ReactNode } from "react";
import type { MochiHat, MochiMood } from "./types";

/** 身体轮廓：所有表情共用，切换表情时团子还是「同一只」 */
export const BODY_PATH = "M15 84C9 52 31 24 60 24s51 28 45 60c-1 7-8 10-45 10S16 91 15 84z";

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

/** 细墨线下的五官要小：眼睛是两粒芝麻，嘴是一个小小的 ω */
function OpenEye({ cx, cy, big = false }: { cx: number; cy: number; big?: boolean }) {
  const rx = big ? 4.2 : 3.6;
  const ry = big ? 5.2 : 4.6;
  return (
    <g className="mochi-eye">
      <ellipse className="mochi-pupil" cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--mochi-face)" />
      <circle cx={cx + 1.3} cy={cy - 1.9} r={1.25} fill="#fff" />
    </g>
  );
}

function DizzyEye({ x, line }: { x: number; line: Stroke }) {
  return <path className="mochi-spin" d={`M${x} 56m-.8 0a1.2 1.2 0 1 1 2 1.2a3.2 3.2 0 1 1-4-3.6a5.2 5.2 0 1 1 6.4 4.8`} fill="none" {...line} />;
}

export function Eyes({ mood, line }: { mood: MochiMood; line: Stroke }) {
  switch (mood) {
    case "wink":
      return (
        <>
          <path d="M39 57q5-5.5 10 0" fill="none" {...line} />
          <OpenEye cx={76} cy={56} />
        </>
      );
    case "curious":
      return (
        <>
          <OpenEye cx={45} cy={55} big />
          <OpenEye cx={77} cy={55} big />
        </>
      );
    case "sleepy":
      return <path d="M38 56q6 4.5 12 0M70 56q6 4.5 12 0" fill="none" {...line} />;
    case "dizzy":
      return (
        <>
          <DizzyEye x={44} line={line} />
          <DizzyEye x={76} line={line} />
        </>
      );
    case "shy":
      return <path d="M39 57q5-5.5 10 0M71 57q5-5.5 10 0" fill="none" {...line} />;
    default:
      return (
        <>
          <OpenEye cx={44} cy={56} />
          <OpenEye cx={76} cy={56} />
        </>
      );
  }
}

export function Mouth({ mood, line }: { mood: MochiMood; line: Stroke }) {
  const thin = { ...line, strokeWidth: line.strokeWidth * 0.85 };
  switch (mood) {
    case "wink":
      return <path d="M55.5 64.5q4.5 6 9 0z" fill="var(--mochi-blush)" {...thin} />;
    case "curious":
      return (
        <g className="mochi-sniff">
          <ellipse cx={60} cy={66} rx={2.2} ry={1.8} fill="var(--mochi-face)" />
        </g>
      );
    case "sleepy":
      return <ellipse cx={60} cy={67} rx={2} ry={2.6} fill="none" {...thin} />;
    case "dizzy":
      return <path d="M53 68q2.3-3 4.6 0t4.6 0t4.6 0" fill="none" {...thin} />;
    case "shy":
      return <path d="M57 66q3 2.2 6 0" fill="none" {...thin} />;
    default:
      return <path d="M56 65q2 2.6 4 0q2 2.6 4 0" fill="none" {...thin} />;
  }
}

export function Cheeks({ mood }: { mood: MochiMood }) {
  const opacity = mood === "shy" ? 0.6 : 0.32;
  return (
    <>
      <ellipse cx={32} cy={67} rx={7} ry={4} fill="var(--mochi-blush)" opacity={opacity} />
      <ellipse cx={88} cy={67} rx={7} ry={4} fill="var(--mochi-blush)" opacity={opacity} />
      {mood === "shy" && (
        <path d="M29 69l2.4-3.2M32.5 69l2.4-3.2M85 69l2.4-3.2M88.5 69l2.4-3.2" stroke="var(--mochi-face)" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
      )}
    </>
  );
}

/** 头顶一片抹茶叶：团子铺的店标，戴帽子时收起 */
export function Leaf({ line }: { line: Stroke }) {
  const leaf = { ...line, stroke: "var(--mochi-leaf-ink)" };
  return (
    <g>
      <path d="M60 25q-1.5-7 3.5-11" fill="none" {...leaf} />
      <path d="M63.5 14q7.5-3 12.5 2.5q-7.5 3.5-12.5-2.5z" fill="var(--mochi-leaf)" {...leaf} strokeWidth={line.strokeWidth * 0.8} />
      <path d="M65 14.6q4.5.6 8.5 1.8" fill="none" {...leaf} strokeWidth={line.strokeWidth * 0.55} opacity={0.7} />
    </g>
  );
}

/** 表情的小道具：画在身体之外，所以不跟随呼吸和招牌动作 */
export function Props({ mood, line }: { mood: MochiMood; line: Stroke }) {
  const thin = { ...line, strokeWidth: line.strokeWidth * 0.8 };
  switch (mood) {
    case "wink":
      return <path d="M98 36l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z" fill="var(--mochi-glow)" {...thin} />;
    case "curious":
      return <path d="M93 22q0-5 5-5t5 4.5q0 3.5-4.5 4.5v3M98.5 33.5v.2" fill="none" {...thin} />;
    case "sleepy":
      return (
        <>
          <text className="mochi-zz" x={93} y={26} fontSize={13}>
            z
          </text>
          <text className="mochi-zz" x={101} y={17} fontSize={10}>
            z
          </text>
        </>
      );
    case "dizzy":
      return <path className="mochi-sweat" d="M97 38q3.5 5 0 8q-3.5-3 0-8z" fill="var(--mochi-wash)" {...thin} />;
    case "shy":
      return <path className="mochi-heart" d="M97 31c-2.5-3.5-7.5-1-5 3.4l5 5 5-5c2.5-4.4-2.5-6.9-5-3.4z" fill="var(--mochi-blush)" {...thin} />;
    default:
      return null;
  }
}

const HATS: Record<Exclude<MochiHat, "none">, (line: Stroke) => ReactNode> = {
  night: (line) => (
    <>
      <path d="M38 32q15-25 43-9l15 6q-2 5-9 2" fill="var(--mochi-azuki)" {...line} />
      <circle cx={97} cy={30} r={4.5} fill="var(--mochi-body-shiro)" {...line} />
      <path d="M36 33q25-9 47-5" fill="none" {...line} />
    </>
  ),
  post: (line) => (
    <g transform="rotate(-8 60 20)">
      <path d="M42 26v-9q18-7 36 0v9z" fill="var(--mochi-body-shiro)" {...line} />
      <path d="M37 27h46q-4 5-13 3.5" fill="var(--mochi-sakura)" {...line} />
    </g>
  ),
  grad: (line) => (
    <g transform="rotate(8 60 18)">
      <path d="M47 24v5q13 5 26 0v-5" fill="var(--mochi-azuki)" {...line} />
      <path d="M38 22l22-9 22 9-22 8z" fill="var(--mochi-body-shiro)" {...line} />
      <path d="M80 23v10" {...line} />
    </g>
  ),
  santa: (line) => (
    <>
      <path d="M40 31q13-24 37-9l16 13" fill="var(--mochi-seal)" {...line} />
      <circle cx={94} cy={35} r={4.5} fill="var(--mochi-body-shiro)" {...line} />
      <path d="M36 33q24-9 48-4" fill="none" stroke="var(--mochi-body-shiro)" strokeWidth={6.5} strokeLinecap="round" />
      <path d="M36 33q24-9 48-4" fill="none" {...line} />
    </>
  ),
};

export function Hat({ hat, line }: { hat: MochiHat; line: Stroke }) {
  return hat === "none" ? <Leaf line={line} /> : <>{HATS[hat](line)}</>;
}
