import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, type CSSProperties } from "react";
import { cn } from "@mochi/ui/cn";
import { autoBlink, trackEyes } from "./motion";
import { BODY_PATH, Cheeks, Eyes, Hat, Mouth, Props, strokeOf } from "./parts";
import { MOODS, type MochiAct, type MochiColor, type MochiHat, type MochiMood } from "./types";

/** 低于此尺寸时去掉高光、腮红与道具，只留轮廓和五官 */
export const SIMPLE_BELOW = 32;
const ACT_FALLBACK_MS = 1600;

/** 描边换算到 viewBox 单位：屏幕上约 1.6px 的细墨线，小尺寸加粗到可辨 */
export function strokeWidthFor(size: number): number {
  return Math.max(1.8, Math.min(5.5, (1.6 * 120) / size));
}

export interface MochiHandle {
  /** 播放招牌动作，默认取当前表情的动作 */
  play(act?: MochiAct): void;
}

export interface MochiProps {
  mood?: MochiMood;
  color?: MochiColor;
  hat?: MochiHat;
  /** 渲染宽度（px），高度按 120:100 等比 */
  size?: number;
  /** 眼睛跟随鼠标 */
  track?: boolean;
  /** 随机眨眼 */
  blink?: boolean;
  /** 可以戳：渲染为按钮，点击播放招牌动作并回调 */
  onPoke?: () => void;
  /** 无障碍名称；不传时团子视为装饰，对读屏隐藏 */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export const Mochi = forwardRef<MochiHandle, MochiProps>(function Mochi(
  { mood = "happy", color = "sakura", hat = "none", size = 120, track = false, blink = true, onPoke, label, className, style },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const simple = size < SIMPLE_BELOW;
  const line = strokeOf(strokeWidthFor(size));

  const play = useCallback(
    (act: MochiAct = MOODS[mood].act) => {
      const svg = svgRef.current;
      if (!svg) return;
      delete svg.dataset.act;
      // 读一次布局，让同名动画可以连续重播
      svg.getBoundingClientRect();
      svg.dataset.act = act;
      const clear = () => {
        if (svg.dataset.act === act) delete svg.dataset.act;
      };
      svg.addEventListener("animationend", clear, { once: true });
      setTimeout(clear, ACT_FALLBACK_MS);
    },
    [mood],
  );
  useImperativeHandle(ref, () => ({ play }), [play]);

  useEffect(() => (track && svgRef.current ? trackEyes(svgRef.current) : undefined), [track]);
  useEffect(() => (blink && svgRef.current ? autoBlink(svgRef.current) : undefined), [blink]);

  const name = label ?? (onPoke ? `团子 · ${MOODS[mood].label}` : undefined);
  const svg = (
    <svg
      ref={svgRef}
      className="mochi-svg"
      viewBox="0 0 120 104"
      data-mood={mood}
      role={name && !onPoke ? "img" : undefined}
      aria-labelledby={name && !onPoke ? titleId : undefined}
      aria-hidden={name && !onPoke ? undefined : true}
    >
      {name && !onPoke && <title id={titleId}>{name}</title>}
      <ellipse cx={60} cy={98} rx={34} ry={3.5} fill="var(--mochi-ground)" />
      <g className="mochi-body">
        <path d={BODY_PATH} fill={`var(--mochi-body-${color})`} {...line} />
        {!simple && (
          <path d="M33 43q6-9 15-12" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
        )}
        {!simple && <Cheeks mood={mood} />}
        <Eyes mood={mood} line={line} />
        <Mouth mood={mood} line={line} />
        <Hat hat={hat} line={line} />
      </g>
      {!simple && <Props mood={mood} line={line} />}
    </svg>
  );

  const box = cn("inline-block shrink-0 align-middle leading-none", className);
  const sized = { width: size, ...style };
  if (!onPoke) {
    return (
      <span className={box} style={sized}>
        {svg}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={name}
      className={cn(box, "cursor-pointer rounded-md border-0 bg-transparent p-0")}
      style={sized}
      onClick={() => {
        play();
        onPoke();
      }}
    >
      {svg}
    </button>
  );
});
