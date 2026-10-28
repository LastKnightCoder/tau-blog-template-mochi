import { useChrome } from "./context";

/** 页脚：一条细线，左边小小的店名，右边落款 */
export function Footer() {
  const { site } = useChrome();
  return (
    <footer className="mx-auto mt-auto flex w-full max-w-[1120px] items-center gap-4 px-14 pt-10 pb-10 text-[13px] text-ink-3 max-md:px-6">
      <span className="h-px flex-1 bg-rule" aria-hidden />
      <span>
        © {new Date().getFullYear()} {site.title}，用 Tau 写成
      </span>
    </footer>
  );
}
