import { useRef, useState, type ReactNode } from "react";
import { Mochi, type MochiHandle, type MochiMood } from "@mochi/mochi";
import { useIdle } from "@mochi/mochi/useIdle";
import { joinBase } from "@mochi/data/routes";
import type { HomeView, Linked } from "@mochi/data/types";
import type * as Published from "@tau/blog";
import { Bubble } from "@mochi/ui";
import { useChrome, usePageOf } from "@mochi/app/context";
import { isFresh, shortDate, truncate } from "@mochi/app/format";
import { useMode } from "@mochi/app/theme";
import { Layout } from "@mochi/app/Layout";
import { BookIcon, CardIcon, LetterIcon } from "./icons";

const RECENT_LIMIT = 6;
const SLEEP_AFTER_MS = 40_000;
const KIND_LABEL = { article: "文章", card: "卡片", doc: "文档" } as const;

/** 首页主角：坐在樱色圆上的团子，身旁一块竖排招牌和一枚店印 */
function Mascot() {
  const { site } = useChrome();
  const mode = useMode();
  const mochi = useRef<MochiHandle>(null);
  const pokes = useRef(0);
  const idle = useIdle(SLEEP_AFTER_MS);
  const [line, setLine] = useState<string | null>(null);
  const [dizzy, setDizzy] = useState(false);
  const sleeping = idle || mode === "dark";
  const mood: MochiMood = dizzy ? "dizzy" : sleeping ? "sleepy" : "happy";
  const said = idle ? "Zzz……" : line;

  const poke = () => {
    pokes.current += 1;
    if (pokes.current % 10 === 0) {
      setDizzy(true);
      setLine("被戳晕了……");
      setTimeout(() => setDizzy(false), 2000);
      return;
    }
    setLine(site.mascotLines[pokes.current % site.mascotLines.length]);
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px]">
      <span aria-hidden className="mochi-halo absolute inset-0 rounded-full" />
      <div className="absolute inset-x-0 top-[14%] flex flex-col items-center gap-3">
        <div className="flex h-9 items-end">{said && <Bubble tailAlign="center">{said}</Bubble>}</div>
        <Mochi
          ref={mochi}
          mood={mood}
          size={220}
          color={site.mascotColor}
          hat={mode === "dark" ? "night" : "none"}
          track={site.ambient}
          blink={site.ambient}
          onPoke={poke}
          label={`${site.mascotName}，戳一下`}
        />
      </div>
      <span className="absolute top-[20%] -right-1.5 rounded-xs border-hair bg-paper px-1.5 py-3.5 text-[14px] tracking-[0.3em] text-ink-2 [writing-mode:vertical-rl]">
        {sleeping ? "打烊中" : "今日现做"}
      </span>
      <span
        aria-hidden
        className="absolute bottom-[10%] left-[6%] grid size-16 -rotate-[8deg] place-items-center rounded-[12px] bg-seal text-center text-[15px] leading-tight tracking-[0.1em] text-on-seal shadow-[inset_0_0_0_3px_var(--mochi-paper),inset_0_0_0_4px_var(--mochi-seal)]"
      >
        {[...site.mascotName].slice(0, 2).join("")}
        <br />
        之印
      </span>
    </div>
  );
}

function Counts({ home }: { home: HomeView }) {
  const items: Array<[number, string]> = [
    [home.stats.articles, "篇文章"],
    [home.stats.cards, "张卡片"],
    [home.docStats.projects, "个项目"],
  ];
  return (
    <dl className="mt-9 flex gap-9">
      {items.map(([count, unit]) => (
        <div key={unit} className="flex flex-col-reverse">
          <dt className="text-[14px] text-ink-2">{unit}</dt>
          <dd className="m-0 font-num text-[30px] leading-[1.1] text-ink">{count}</dd>
        </div>
      ))}
    </dl>
  );
}

interface MenuItem {
  href: string;
  title: string;
  line: string;
  icon: ReactNode;
  fresh: number;
}

/** 三个分区是一张横向的菜单，用竖线隔开 */
function Menu({ items }: { items: MenuItem[] }) {
  if (!items.length) return null;
  return (
    <nav
      aria-label="分区"
      className="mt-6 grid border-t border-solid border-rule max-md:!grid-cols-1"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="group relative block border-0 border-r border-solid border-rule px-7 pt-7 pb-8 text-ink no-underline transition-colors duration-300 ease-soft last:border-r-0 hover:bg-wash max-md:border-r-0 max-md:border-b max-md:px-1"
        >
          {item.fresh > 0 && <span className="absolute top-7 right-7 text-[13px] text-sakura-ink max-md:right-1">新到 {item.fresh} 篇</span>}
          <span className="mb-3.5 block w-[58px] transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:-rotate-[4deg]">{item.icon}</span>
          <h2 className="text-[22px] font-normal tracking-[0.08em]">{item.title}</h2>
          <p className="mt-1 text-[14px] text-ink-2">{item.line}</p>
        </a>
      ))}
    </nav>
  );
}

function Recent({ items }: { items: Array<Linked<Published.TimelineItem>> }) {
  return (
    <section aria-labelledby="recent-title" className="mt-14">
      <h2 id="recent-title" className="mb-3 text-[15px] font-normal tracking-[0.1em] text-ink-2">
        最近做好的
      </h2>
      {items.length === 0 ? (
        <p className="border-t border-solid border-rule py-6 text-ink-2">还没有发布内容。在 Tau 里写好一篇，发布后会出现在这里。</p>
      ) : (
        <ul className="m-0 list-none border-t border-solid border-rule p-0">
          {items.map((item) => (
            <li key={item.target.key}>
              <a
                href={item.href}
                className="group grid grid-cols-[70px_1fr_auto] items-baseline gap-[18px] border-0 border-b border-dotted border-rule py-3.5 text-[16px] text-ink no-underline"
              >
                <time dateTime={new Date(item.publishTime).toISOString()} className="font-num text-[13.5px] text-ink-2">
                  {shortDate(item.publishTime)}
                </time>
                <span className="truncate transition-colors duration-200 group-hover:text-sakura-ink">
                  {truncate(item.title || item.summary, 40)}
                  {isFresh(item.publishTime) && <span className="ml-2.5 text-[12.5px] text-sakura-ink">新</span>}
                </span>
                <span className="text-[12.5px] text-ink-3">{KIND_LABEL[item.type]}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function HomePage() {
  const home = usePageOf("home");
  const { site, collections, navigation } = useChrome();
  const has = (kind: string) => navigation.some((item) => item.kind === kind);
  const fresh = (type: Published.TimelineItem["type"]) => home.timeline.filter((item) => item.type === type && isFresh(item.publishTime)).length;
  const firstBook = collections[0]?.items[0];
  const menu: MenuItem[] = [
    ...(has("articles")
      ? [{ href: joinBase(site.basePath, "/articles"), title: "文章", line: `写给你的长信，${home.stats.articles} 篇`, icon: <LetterIcon />, fresh: fresh("article") }]
      : []),
    ...(has("cards")
      ? [{ href: joinBase(site.basePath, "/cards"), title: "卡片", line: `随手记下的小想法，${home.stats.cards} 张`, icon: <CardIcon />, fresh: fresh("card") }]
      : []),
    ...(firstBook
      ? [{ href: firstBook.href, title: "项目", line: `一本本做完的小册子，${home.docStats.projects} 本`, icon: <BookIcon />, fresh: fresh("doc") }]
      : []),
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-[1120px] px-14 pt-8 pb-6 max-md:px-6">
        <section className="grid grid-cols-[1fr_360px] items-center gap-[60px] max-lg:grid-cols-1 max-lg:gap-10">
          <div>
            <h1 className="text-[68px] leading-[1.12] font-normal tracking-[0.06em] max-sm:text-[46px]" aria-label={site.title}>
              {[...site.title].map((char, index) => (
                <span key={index} aria-hidden className="mochi-char-in inline-block" style={{ animationDelay: `${0.08 + index * 0.07}s` }}>
                  {char}
                </span>
              ))}
            </h1>
            {site.description && <p className="mt-6 max-w-[430px] text-[17px] leading-[2] text-ink-2">{site.description}</p>}
            <Counts home={home} />
          </div>
          <Mascot />
        </section>
        <Menu items={menu} />
        <Recent items={home.timeline.slice(0, RECENT_LIMIT)} />
      </div>
    </Layout>
  );
}
