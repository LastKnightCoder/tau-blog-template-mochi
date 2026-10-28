import { useEffect, useRef, useState } from "react";
import { Mochi, type MochiHandle } from "@mochi/mochi";
import { joinBase } from "@mochi/data/routes";
import { Button, cn, DayNightSwitch } from "@mochi/ui";
import { useChrome, useSite } from "./context";
import { useLocation } from "./navigation";
import { setMode, useMode } from "./theme";
import { useMochiRain } from "./MochiRain";

const RAIN_CLICKS = 5;
const RAIN_WINDOW_MS = 1200;

/** 导航只是文字；当前分区下面一条店印色细线 */
const navLink =
  "relative cursor-pointer border-0 bg-transparent p-0 py-1 font-body text-[15px] text-ink-2 no-underline transition-colors duration-200 ease-soft hover:text-ink";
const navCurrent = "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-seal after:content-['']";

/** 当前页属于哪个导航：文章详情点亮「文章」，卡片详情点亮「卡片」 */
function activeKind(route: string) {
  if (route.startsWith("/articles")) return "articles";
  if (route.startsWith("/cards")) return "cards";
  if (route.startsWith("/projects")) return "projects";
  return undefined;
}

/** 项目下拉：一张细线纸片，列出每本小册子 */
function Projects() {
  const { collections } = useChrome();
  const books = collections.flatMap((collection) => collection.items);
  const [open, setOpen] = useState(false);
  const active = useLocation().route.startsWith("/projects");
  if (!books.length) return null;
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((value) => !value)} className={cn(navLink, active && navCurrent)}>
        项目
      </button>
      {open && (
        <div className="absolute top-full left-1/2 z-40 -translate-x-1/2 pt-3">
          <ul className="mochi-pop m-0 min-w-[200px] list-none rounded-md border-hair bg-paper-hi p-1.5 shadow-float">
            {books.map((book) => (
              <li key={book.id}>
                <a
                  href={book.href}
                  onClick={() => setOpen(false)}
                  aria-current={book.active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm px-3 py-2 text-[14.5px] text-ink no-underline transition-colors duration-150 hover:bg-wash",
                    book.active && "text-sakura-ink",
                  )}
                >
                  <i aria-hidden className={cn("size-1.5 rounded-full", book.active ? "bg-seal" : "bg-rule-strong")} />
                  {book.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <circle cx={11} cy={11} r={6.5} />
    <path d="M16 16l4 4" />
  </svg>
);

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

  // 连点店标 5 次下一阵团子雨；第一下照常回首页
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
    <header className="relative z-30 mx-auto flex w-full max-w-[1120px] flex-wrap items-center gap-x-7 gap-y-3 px-14 py-6 max-md:px-6">
      <a href={joinBase(basePath, "/")} onClick={onLogo} className="flex items-center gap-2.5 text-[19px] tracking-[0.12em] text-ink no-underline">
        <Mochi ref={logo} size={34} color={page.site.mascotColor} hat={mode === "dark" ? "night" : "none"} />
        {page.site.title}
      </a>
      <nav aria-label="主导航" className="ml-auto flex items-center gap-7 max-md:order-last max-md:ml-0 max-md:w-full">
        {page.navigation.map((item) => (
          <a key={item.href} href={item.href} aria-current={kind === item.kind ? "page" : undefined} className={cn(navLink, kind === item.kind && navCurrent)}>
            {item.label}
          </a>
        ))}
        <Projects />
      </nav>
      <div className="flex items-center gap-2 max-md:ml-auto">
        <Button icon={<SearchIcon />} aria-label="搜索（⌘K）" title="搜索（⌘K）" onClick={openSearch} className="text-ink-2" />
        <DayNightSwitch mode={mode} onChange={setMode} />
      </div>
    </header>
  );
}
