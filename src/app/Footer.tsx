import { useChrome } from "./context";
import { Snail } from "./scenery";

/** 页脚是一小片草地，开着小镇动画时有一只蜗牛慢慢爬过 */
export function Footer() {
  const { site } = useChrome();
  return (
    <footer className="relative mt-auto flex items-end gap-4 mochi-meadow border-t-[1.5px] border-solid border-sheet-line px-14 pt-6 pb-4 text-[13px] text-ink-2 max-sm:px-5">
      <span aria-hidden className="mochi-grass absolute inset-x-0 -top-3.5 h-3.5" />
      {site.ambient && <Snail className="mochi-crawl w-[46px]" />}
      <span className="ml-auto">
        © {new Date().getFullYear()} {site.title} · 用 Tau 写成
      </span>
    </footer>
  );
}
