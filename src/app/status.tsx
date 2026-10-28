import { Mochi, type MochiColor } from "@mochi/mochi";
import { Button } from "@mochi/ui";

/** 首次加载：三只团子轮流跳 */
export function LoadingTown() {
  const colors: MochiColor[] = ["pink", "mint", "sky"];
  return (
    <main role="status" aria-live="polite" className="grid min-h-dvh place-items-center text-center">
      <div>
        <div className="flex justify-center gap-2.5">
          {colors.map((color, index) => (
            <span key={color} className="mochi-hop" style={{ animationDelay: `${index * 0.15}s` }}>
              <Mochi color={color} size={34} blink={false} />
            </span>
          ))}
        </div>
        <p className="mt-3 text-[14px] text-ink-2">团子们正在搬运文字……</p>
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
        <div aria-hidden className="flex items-center justify-center gap-1.5 font-head text-[120px] leading-none text-accent-ink">
          4<Mochi mood="dizzy" size={120} />4
        </div>
        <h1 className="mt-3.5 font-head text-[28px]">{reason ? `${name}没能打开这一页` : `${name}找不到这一页了`}</h1>
        <p className="mt-2 mb-6 text-ink-2">{reason ?? "它可能被搬走了，或者从来没有存在过。"}</p>
        <a href={homeHref} className="no-underline">
          <Button variant="primary" tabIndex={-1}>
            🏠 带{name}回家
          </Button>
        </a>
      </div>
    </div>
  );
}
