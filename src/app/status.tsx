import { Mochi, type MochiColor } from "@mochi/mochi";
import { Button } from "@mochi/ui";

/** 首次加载：三只团子轮流跳 */
export function LoadingTown() {
  const colors: MochiColor[] = ["sakura", "matcha", "kuri"];
  return (
    <main role="status" aria-live="polite" className="grid min-h-dvh place-items-center text-center">
      <div>
        <div className="flex justify-center gap-2.5">
          {colors.map((color, index) => (
            <span key={color} className="mochi-hop" style={{ animationDelay: `${index * 0.15}s` }}>
              <Mochi color={color} size={30} blink={false} />
            </span>
          ))}
        </div>
        <p className="mt-4 text-[14px] tracking-[0.08em] text-ink-2">团子们正在摆盘……</p>
      </div>
    </main>
  );
}

interface LostProps {
  name: string;
  homeHref: string;
  /** 数据读取失败时的原因；不传表示页面不存在 */
  reason?: string;
}

/** 404 与读取失败：「0」就是晕乎乎的团子 */
export function LostTown({ name, homeHref, reason }: LostProps) {
  return (
    <div role={reason ? "alert" : undefined} className="grid min-h-[60vh] place-items-center px-6 py-16 text-center">
      <div>
        <div aria-hidden className="mx-auto w-[150px]">
          <Mochi mood="dizzy" size={150} />
        </div>
        <h1 className="mt-6 text-[28px] font-normal tracking-[0.06em]">{reason ? `${name}没能打开这一页` : `${name}找不到这一页了`}</h1>
        <p className="mt-2 mb-7 text-ink-2">{reason ?? "它可能被搬走了，或者从来没有存在过。"}</p>
        <a href={homeHref} className="no-underline">
          <Button variant="primary" tabIndex={-1}>
            回到首页
          </Button>
        </a>
      </div>
    </div>
  );
}
