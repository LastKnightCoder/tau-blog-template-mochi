import { createContext, useCallback, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { Mochi, type MochiColor, type MochiMood } from "@mochi/mochi";
import { prefersReducedMotion } from "@mochi/mochi/motion";

const DROPS = 26;
const LIFETIME_MS = 4200;
const COLORS: MochiColor[] = ["pink", "mint", "sky", "butter"];
const MOODS: MochiMood[] = ["happy", "wink", "shy"];

interface Drop {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  spin: number;
}

const RainContext = createContext<() => void>(() => {});

export function useMochiRain() {
  return useContext(RainContext);
}

/** 彩蛋：一阵小团子从天上掉下来；减弱动态效果时不下 */
export function MochiRainProvider({ children }: { children: ReactNode }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const rain = useCallback(() => {
    if (prefersReducedMotion()) return;
    const seed = Date.now();
    setDrops(
      Array.from({ length: DROPS }, (_, index) => ({
        id: seed + index,
        left: Math.random() * 96,
        size: 30 + Math.random() * 30,
        duration: 1.6 + Math.random() * 1.6,
        delay: Math.random() * 0.8,
        spin: (Math.random() - 0.5) * 360,
      })),
    );
    setTimeout(() => setDrops((current) => current.filter((drop) => drop.id < seed)), LIFETIME_MS);
  }, []);
  return (
    <RainContext.Provider value={rain}>
      {children}
      {drops.length > 0 && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
          {drops.map((drop, index) => (
            <span
              key={drop.id}
              className="mochi-rain absolute -top-20"
              style={
                {
                  left: `${drop.left}%`,
                  animationDuration: `${drop.duration}s`,
                  animationDelay: `${drop.delay}s`,
                  "--spin": `${drop.spin}deg`,
                } as CSSProperties
              }
            >
              <Mochi size={drop.size} color={COLORS[index % COLORS.length]} mood={MOODS[index % MOODS.length]} blink={false} />
            </span>
          ))}
        </div>
      )}
    </RainContext.Provider>
  );
}
