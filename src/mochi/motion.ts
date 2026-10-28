/**
 * 全页团子共用一个指针监听和一个眨眼定时器：列表页可能同时有几十只团子。
 * 系统开启「减弱动态效果」时不注册任何运动（表情变化仍保留）。
 */

const MAX_PUPIL_X = 3.5;
const MAX_PUPIL_Y = 3;
const FULL_LOOK_DISTANCE = 300;
const BLINK_INTERVAL = 2400;
const BLINK_CHANCE = 0.25;
const BLINK_DURATION = 150;

const tracked = new Set<SVGSVGElement>();
const blinking = new Set<SVGSVGElement>();
let frame = 0;
let lastPointer: { x: number; y: number } | null = null;
let blinkTimer: ReturnType<typeof setInterval> | undefined;

export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 瞳孔朝向：离团子越远看得越偏，300px 外到达眼眶边缘 */
export function pupilOffset(dx: number, dy: number): { x: number; y: number } {
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return { x: 0, y: 0 };
  const reach = Math.min(1, distance / FULL_LOOK_DISTANCE);
  return { x: (dx / distance) * MAX_PUPIL_X * reach, y: (dy / distance) * MAX_PUPIL_Y * reach };
}

function look() {
  frame = 0;
  if (!lastPointer) return;
  for (const svg of tracked) {
    const box = svg.getBoundingClientRect();
    if (!box.width || box.bottom < 0 || box.top > window.innerHeight) continue;
    const offset = pupilOffset(lastPointer.x - (box.left + box.width / 2), lastPointer.y - (box.top + box.height / 2));
    svg.querySelectorAll<SVGGElement>(".mochi-eye").forEach((eye) => {
      eye.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    });
  }
}

function onPointerMove(event: PointerEvent) {
  lastPointer = { x: event.clientX, y: event.clientY };
  if (!frame) frame = requestAnimationFrame(look);
}

export function trackEyes(svg: SVGSVGElement): () => void {
  if (prefersReducedMotion()) return () => {};
  if (tracked.size === 0) window.addEventListener("pointermove", onPointerMove, { passive: true });
  tracked.add(svg);
  return () => {
    tracked.delete(svg);
    if (tracked.size > 0) return;
    window.removeEventListener("pointermove", onPointerMove);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastPointer = null;
  };
}

function blinkSome() {
  for (const svg of blinking) {
    if (Math.random() >= BLINK_CHANCE) continue;
    svg.dataset.blink = "";
    setTimeout(() => delete svg.dataset.blink, BLINK_DURATION);
  }
}

export function autoBlink(svg: SVGSVGElement): () => void {
  if (prefersReducedMotion()) return () => {};
  blinking.add(svg);
  blinkTimer ??= setInterval(blinkSome, BLINK_INTERVAL);
  return () => {
    blinking.delete(svg);
    delete svg.dataset.blink;
    if (blinking.size === 0 && blinkTimer !== undefined) {
      clearInterval(blinkTimer);
      blinkTimer = undefined;
    }
  };
}
