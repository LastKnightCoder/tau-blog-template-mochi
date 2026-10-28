import { useEffect, useRef, useState } from "react";
import { Mochi, type MochiHandle } from "@mochi/mochi";
import { joinBase } from "@mochi/data/routes";
import { cn, DayNightSwitch, Kbd } from "@mochi/ui";
import { useChrome, useSite } from "./context";
import { useLocation } from "./navigation";
import { setMode, useMode } from "./theme";
import { useMochiRain } from "./MochiRain";

const RAIN_CLICKS = 5;
const RAIN_WINDOW_MS = 1200;

const pill =
  "inline-flex items-center rounded-full border-sticker bg-paper px-4 pt-[9px] pb-2 font-head text-[15px] leading-none text-ink no-underline shadow-lift-s transition-[transform,box-shadow,background-color] duration-300 ease-spring hover:-translate-y-[3px] hover:-rotate-2 hover:shadow-[0_5px_0_var(--mochi-shadow-color)] active:translate-y-0.5 active:shadow-none";

/** 当前页属于哪个导航：文章详情点亮「文章」，卡片详情点亮「卡片」 */
function activeKind(route: string) {
  if (route.startsWith("/articles")) return "articles";
  if (route.startsWith("/cards")) return "cards";
  if (route.startsWith("/projects")) return "projects";
  return undefined;
}

function Bookshelf() {
  const { collections } = useChrome();
  const books = collections.flatMap((collection) => collection.items);
  const [open, setOpen] = useState(false);
  const spineTones = ["bg-mint", "bg-pink", "bg-sky", "bg-butter", "bg-lilac", "bg-peach"];
  const active = useLocation().route.startsWith("/projects");
  if (!books.length) return null;
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={cn(pill, "cursor-pointer", active && "bg-butter")}
      >
        项目 ▾
      </button>
      {open && (
        <div className="absolute top-full left-0 z-40 pt-3.5">
          <div className="relative flex items-end gap-1.5 rounded-lg border-sheet bg-paper px-4 pt-8 shadow-sheet after:absolute after:inset-x-[-1.5px] after:bottom-[-1.5px] after:h-2.5 after:rounded-b-[16px] after:border-t-[1.5px] after:border-solid after:border-sheet-line after:bg-soft-peach after:content-['']">
            <span className="absolute top-2 left-4 text-[12px] whitespace-nowrap text-ink-2">从书架上抽一本 ↓</span>
            {books.map((book, index) => (
              <a
                key={book.id}
                href={book.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative z-10 w-9 rounded-t-[6px] border-sticker border-b-0 px-0 pt-2.5 pb-[18px] text-center font-head text-[14px] text-ink no-underline [writing-mode:vertical-rl] transition-transform duration-300 ease-spring hover:-translate-y-3 hover:-rotate-3",
                  spineTones[index % spineTones.length],
                  book.active && "outline-3 outline-offset-2 outline-accent outline-dashed",
                )}
                style={{ height: 92 + ((book.title.length * 7) % 40) }}
              >
                {book.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { site, openSearch } = useSite();
  const page = useChrome();
  const mode = useMode();
  const { route } = useLocation();
  const kind = activeKind(route);
  const logo = useRef<MochiHandle>(null);
  const clicks = useRef<{ count: number; timer?: ReturnType<typeof setTimeout> }>({ count: 0 });
  const rain = useMochiRain();
  const basePath = site.manifest.site.basePath;

  useEffect(() => () => clearTimeout(clicks.current.timer), []);

  // 连点 Logo 5 次下一阵团子雨；第一下照常回首页
  const onLogo = () => {
    logo.current?.play("boing");
    const state = clicks.current;
    state.count += 1;
    clearTimeout(state.timer);
    state.timer = setTimeout(() => (state.count = 0), RAIN_WINDOW_MS);
    if (state.count >= RAIN_CLICKS) {
      state.count = 0;
      rain();
    }
  };

  return (
    <header className="relative z-30 flex flex-wrap items-center gap-3.5 border-b-[1.5px] border-dashed border-sheet-line px-7 py-3.5 max-sm:px-4">
      <a href={joinBase(basePath, "/")} onClick={onLogo} className="flex items-center gap-1.5 font-head text-[24px] text-ink no-underline">
        <Mochi ref={logo} size={40} color={page.site.mascotColor} hat={mode === "dark" ? "night" : "none"} />
        {page.site.title}
      </a>
      <nav aria-label="主导航" className="ml-3.5 flex items-center gap-2.5 max-md:order-last max-md:ml-0 max-md:w-full max-md:overflow-x-auto max-md:pb-1">
        {page.navigation.map((item) => (
          <a key={item.href} href={item.href} aria-current={kind === item.kind ? "page" : undefined} className={cn(pill, kind === item.kind && "bg-butter")}>
            {item.label}
          </a>
        ))}
        <Bookshelf />
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={openSearch}
          className="flex cursor-pointer items-center gap-2 rounded-md border-sticker bg-paper py-[7px] pr-2.5 pl-3.5 font-body text-[14px] text-ink-2 shadow-lift-s transition-transform duration-300 ease-spring hover:-translate-y-0.5"
        >
          <span aria-hidden>🔍</span>
          <span className="max-sm:sr-only">找点什么</span>
          <span className="max-sm:hidden">
            <Kbd>⌘K</Kbd>
          </span>
        </button>
        <DayNightSwitch mode={mode} onChange={setMode} />
      </div>
    </header>
  );
}
