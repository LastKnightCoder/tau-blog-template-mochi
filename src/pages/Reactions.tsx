import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { prefersReducedMotion } from "@mochi/mochi/motion";
import { cn } from "@mochi/ui";

const REACTIONS = [
  { id: "like", emoji: "💗", label: "喜欢" },
  { id: "feed", emoji: "🍡", label: "投喂团子" },
  { id: "learned", emoji: "✨", label: "学到了" },
] as const;

type ReactionId = (typeof REACTIONS)[number]["id"];
const PARTICLES = 8;
const PARTICLE_MS = 950;
const storageKey = (key: string) => `mochi:reactions:${key}`;

/**
 * 静态站点没有后端，不显示全站计数；只在本机记住「我点过」，再次进来按钮保持点亮。
 */
function readPicked(key: string): ReactionId[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(key)) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is ReactionId => REACTIONS.some((item) => item.id === id)) : [];
  } catch {
    return [];
  }
}

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  spin: number;
}

export function Reactions({ contentKey, onReact }: { contentKey: string; onReact?: () => void }) {
  const [picked, setPicked] = useState<ReactionId[]>(() => readPicked(contentKey));
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => setPicked(readPicked(contentKey)), [contentKey]);

  const fountain = (event: MouseEvent<HTMLButtonElement>, emoji: string) => {
    if (prefersReducedMotion()) return;
    const box = event.currentTarget.getBoundingClientRect();
    const seed = Date.now();
    const burst = Array.from({ length: PARTICLES }, (_, index) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const distance = 50 + Math.random() * 60;
      return { id: seed + index, emoji, x: box.left + box.width / 2 - 9, y: box.top - 4, dx: Math.cos(angle) * distance, dy: Math.sin(angle) * distance, spin: (Math.random() - 0.5) * 120 };
    });
    setParticles((current) => [...current, ...burst]);
    setTimeout(() => setParticles((current) => current.filter((particle) => particle.id < seed || particle.id >= seed + PARTICLES)), PARTICLE_MS);
  };

  const react = (event: MouseEvent<HTMLButtonElement>, id: ReactionId, emoji: string) => {
    fountain(event, emoji);
    onReact?.();
    if (picked.includes(id)) return;
    const next = [...picked, id];
    setPicked(next);
    try {
      localStorage.setItem(storageKey(contentKey), JSON.stringify(next));
    } catch {
      // 存不下也只是下次进来按钮不亮
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {REACTIONS.map(({ id, emoji, label }) => {
        const on = picked.includes(id);
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={(event) => react(event, id, emoji)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-full border-hair bg-transparent px-4 py-1.5 font-body text-[14px] text-ink transition-[color,border-color,background-color] duration-200 ease-soft hover:border-seal hover:text-sakura-ink active:scale-95",
              on && "border-seal bg-tint-sakura text-sakura-ink",
            )}
          >
            <span aria-hidden>{emoji}</span>
            {label}
          </button>
        );
      })}
      {particles.length > 0 &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed inset-0 z-[999]">
            {particles.map((particle) => (
              <span
                key={particle.id}
                className="mochi-particle absolute text-[18px]"
                style={{ left: particle.x, top: particle.y, "--dx": `${particle.dx}px`, "--dy": `${particle.dy}px`, "--spin": `${particle.spin}deg` } as CSSProperties}
              >
                {particle.emoji}
              </span>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
