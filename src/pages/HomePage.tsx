import { useRef, useState } from "react";
import { Mochi, type MochiHandle, type MochiMood } from "@mochi/mochi";
import { useIdle } from "@mochi/mochi/useIdle";
import { joinBase } from "@mochi/data/routes";
import type { HomeView, Linked } from "@mochi/data/types";
import type * as Published from "@tau/blog";
import { Bubble, Chip, cn, KIND_TONES } from "@mochi/ui";
import { useChrome, usePageOf } from "@mochi/app/context";
import { isFresh, shortDate, truncate } from "@mochi/app/format";
import { Cloud } from "@mochi/app/scenery";
import { greeting, useMode } from "@mochi/app/theme";
import { Layout } from "@mochi/app/Layout";
import { Bush, Lamp, LIBRARY, NOTE_SHOP, POST_OFFICE, Tree, type Building } from "./houses";

const RECENT_LIMIT = 5;
const SLEEP_AFTER_MS = 40_000;
const KIND_LABEL = { article: "信", card: "签", doc: "书" } as const;

interface HouseProps {
  href: string;
  name: string;
  count: string;
  building: Building;
  fresh: number;
  peek: MochiMood;
}

const percent = (value: number, total: number) => `${(value / total) * 100}%`;

/** 绘本小屋：悬停时整栋上抬，门向内打开，团子从门里探出头 */
function House({ href, name, count, building, fresh, peek }: HouseProps) {
  const { site } = useChrome();
  const { width, height, door } = building;
  return (
    <a href={href} className="group relative block w-[150px] shrink-0 text-center text-ink no-underline max-lg:w-[130px]">
      {fresh > 0 && (
        <span className="mochi-bob absolute -top-1.5 -right-2 z-10 rounded-full border-sticker bg-accent-ink px-2.5 py-0.5 font-head text-[13px] text-on-accent">
          +{fresh}
          <span className="sr-only"> 篇新内容</span>
        </span>
      )}
      <div className="relative transition-transform duration-[450ms] ease-spring group-hover:-translate-y-2 group-hover:-rotate-[1.5deg]" style={{ aspectRatio: `${width} / ${height}` }}>
        <svg viewBox={`0 0 ${width} ${height}`} aria-hidden className="absolute inset-0 size-full overflow-visible">
          {building.draw({ smoke: site.ambient })}
        </svg>
        <div
          className="absolute overflow-hidden bg-ink"
          style={{
            left: percent(door.x, width),
            top: percent(door.y, height),
            width: percent(door.width, width),
            height: percent(door.height, height),
            borderRadius: "999px 999px 0 0",
          }}
        >
          <span className="absolute inset-x-0 bottom-[-6%] flex translate-y-[70%] justify-center transition-transform delay-75 duration-[450ms] ease-spring group-hover:translate-y-[12%]">
            {/* 宽度按门的比例走，门随房子缩放时团子跟着变 */}
            <Mochi mood={peek} size={34} color={site.mascotColor} blink={false} style={{ width: "118%" }} />
          </span>
          <span
            className={cn(
              "absolute inset-0 origin-left rounded-[inherit] border-sticker border-b-0 transition-transform duration-[450ms] ease-spring group-hover:[transform:perspective(160px)_rotateY(-72deg)]",
              building.doorTone,
            )}
          >
            <i className="absolute top-[58%] right-[18%] size-1 rounded-full bg-ink" />
          </span>
        </div>
      </div>
      <div className="mt-2 font-head text-[20px]">
        {name}
        <small className="block font-body text-[13px] text-ink-2">{count}</small>
      </div>
    </a>
  );
}

function Mailbox({ items }: { items: Array<Linked<Published.TimelineItem>> }) {
  const anyFresh = items.some((item) => isFresh(item.publishTime));
  return (
    <section aria-labelledby="mailbox-title" className="self-stretch rounded-lg border-sheet bg-paper px-4 pt-3.5 pb-2.5 shadow-sheet">
      <h2 id="mailbox-title" className="mb-1.5 flex items-center gap-1.5 font-head text-[18px]">
        <span aria-hidden className={cn("inline-block h-5 w-3 origin-bottom rounded-[2px] border-2 border-solid border-line bg-accent", anyFresh && "mochi-flag")} />
        最近寄到
      </h2>
      {items.length === 0 ? (
        <p className="py-4 text-[14px] text-ink-2">邮箱还空着，等第一封信。</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {items.map((item) => (
            <li key={item.target.key}>
              <a
                href={item.href}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md px-2 py-[7px] text-[14px] text-ink no-underline transition-[background-color,transform] duration-300 ease-spring hover:translate-x-1 hover:-rotate-[.6deg] hover:bg-soft-pink"
              >
                <Chip tone={KIND_TONES[item.type]}>{KIND_LABEL[item.type]}</Chip>
                <span className="truncate">
                  {isFresh(item.publishTime) && <span aria-label="新">🆕 </span>}
                  {truncate(item.title || item.summary, 28)}
                </span>
                <time dateTime={new Date(item.publishTime).toISOString()} className="text-[12px] text-ink-2">
                  {shortDate(item.publishTime)}
                </time>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Hero({ home }: { home: HomeView }) {
  const { site } = useChrome();
  const mode = useMode();
  const mochi = useRef<MochiHandle>(null);
  const pokes = useRef(0);
  const idle = useIdle(SLEEP_AFTER_MS);
  const [line, setLine] = useState(`嗨，我是${site.mascotName}，戳戳我也可以哦～`);
  const [dizzy, setDizzy] = useState(false);
  const mood: MochiMood = dizzy ? "dizzy" : idle || mode === "dark" ? "sleepy" : "happy";
  const bubble = idle ? "Zzz……（动一动叫醒我）" : mode === "dark" ? "天黑啦，我戴上睡帽了～" : line;

  const poke = () => {
    pokes.current += 1;
    if (pokes.current % 10 === 0) {
      setDizzy(true);
      setLine("@_@ 被戳晕了……");
      setTimeout(() => setDizzy(false), 2000);
      return;
    }
    setLine(site.mascotLines[pokes.current % site.mascotLines.length]);
  };

  return (
    <div className="relative z-10 grid grid-cols-[1.1fr_.9fr] gap-10 px-14 pt-11 max-md:grid-cols-1 max-md:px-6">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border-sheet bg-paper/80 px-3 py-0.5 text-[13px]">
          {greeting()} · 欢迎来到我的小镇
        </span>
        <h1 className="mt-[18px] mb-1.5 flex flex-wrap font-head text-[64px] leading-[1.1] max-sm:text-[44px]" aria-label={site.title}>
          {[...site.title].map((char, index) => (
            <span
              key={index}
              aria-hidden
              className="mochi-char-in inline-block transition-[transform,color] duration-500 ease-spring hover:-translate-y-3.5 hover:-rotate-[8deg] hover:scale-110 hover:text-accent-ink"
              style={{ animationDelay: `${0.1 + index * 0.08}s` }}
            >
              {char}
            </span>
          ))}
        </h1>
        {site.description && <p className="mt-5 max-w-[420px] text-[17px] leading-[1.9]">{site.description}</p>}
        <dl className="mt-[22px] flex flex-wrap gap-2.5">
          {[
            [home.stats.articles, "封信"],
            [home.stats.cards, "张便签"],
            [home.docStats.projects, "本绘本"],
          ].map(([count, unit]) => (
            <div key={unit} className="flex items-baseline gap-0.5 rounded-sm border-[1.5px] border-dashed border-ink-3 bg-paper/80 px-3 py-1 text-[14px] text-ink-2">
              <dt className="sr-only">{unit}</dt>
              <dd className="m-0 font-latin text-[20px] font-bold text-ink">{count}</dd>
              <span aria-hidden>{unit}</span>
            </div>
          ))}
        </dl>
      </div>
      {/* 气泡与团子同一列居中，尾巴始终指着团子 */}
      <div className="flex flex-col items-center justify-end gap-4 max-md:hidden">
        <Bubble tailAlign="center" className="max-w-[300px] text-center">
          {bubble}
        </Bubble>
        <Mochi
          ref={mochi}
          mood={mood}
          size={200}
          color={site.mascotColor}
          hat={mode === "dark" ? "night" : "none"}
          track
          onPoke={poke}
          label={`${site.mascotName}，戳一下`}
        />
      </div>
    </div>
  );
}

export function HomePage() {
  const home = usePageOf("home");
  const { site, collections, navigation } = useChrome();
  const has = (kind: string) => navigation.some((item) => item.kind === kind);
  const freshCount = (type: Published.TimelineItem["type"]) => home.timeline.filter((item) => item.type === type && isFresh(item.publishTime)).length;
  const firstBook = collections[0]?.items[0];

  return (
    <Layout className="mochi-sky overflow-hidden">
      {site.ambient && (
        <>
          <Cloud width={110} top={40} duration={60} delay={-20} />
          <Cloud width={80} top={120} duration={80} delay={-55} />
        </>
      )}
      <span aria-hidden className="mochi-sun absolute top-6 right-9 size-[70px] rounded-full border-sticker" />
      <span aria-hidden className="mochi-meadow absolute inset-x-[-10%] top-[360px] bottom-0 rounded-[50%_50%_0_0/90px_90px_0_0] border-t-[1.5px] border-solid border-sheet-line" />
      <Hero home={home} />
      <div className="relative z-10 flex items-end gap-10 px-14 pt-10 pb-12 max-xl:flex-col max-xl:items-stretch max-md:px-6">
        {/* 房子挨着排成一条街，空隙里种树、栽花、立路灯；街宽由房子决定，不随屏幕拉开 */}
        <nav aria-label="小镇" className="flex shrink-0 items-end justify-center max-md:flex-col max-md:items-center max-md:gap-6">
          <Bush className="mb-[46px] w-12 shrink-0 max-md:hidden" />
          {has("articles") && (
            <House href={joinBase(site.basePath, "/articles")} name="邮局" count={`${home.stats.articles} 篇文章`} building={POST_OFFICE} fresh={freshCount("article")} peek="happy" />
          )}
          <Tree className="-mx-1 mb-[44px] w-[62px] shrink-0 max-md:hidden" />
          {has("cards") && <House href={joinBase(site.basePath, "/cards")} name="便签屋" count={`${home.stats.cards} 张卡片`} building={NOTE_SHOP} fresh={freshCount("card")} peek="wink" />}
          <Lamp className="mx-1 mb-[46px] w-[26px] shrink-0 max-md:hidden" />
          {firstBook && <House href={firstBook.href} name="图书馆" count={`${home.docStats.projects} 个项目`} building={LIBRARY} fresh={freshCount("doc")} peek="sleepy" />}
          <Bush className="mb-[46px] w-10 shrink-0 -scale-x-100 max-md:hidden" />
        </nav>
        <div className="min-w-[280px] flex-1 self-stretch xl:max-w-[380px]">
          <Mailbox items={home.timeline.slice(0, RECENT_LIMIT)} />
        </div>
      </div>
    </Layout>
  );
}
