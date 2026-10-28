import { useRef, useState, type ReactNode } from "react";
import { COLORS, HATS, Mochi, MOODS, type MochiColor, type MochiHandle, type MochiHat, type MochiMood } from "@mochi/mochi";
import { Bubble, Button, Candy, Card, Chip, DayNightSwitch, Input, KIND_TONES, Kbd, Note, toneForTag } from "@mochi/ui";

/** 开发用样张：逐个展示 token 与基础组件，不进入发布产物 */

const POKE_LINES = ["嘿嘿，好痒～", "今天也要好好写字哦", "我是麻薯做的，不能吃！", "再戳就要变形啦"];
const MOOD_LIST = Object.keys(MOODS) as MochiMood[];
const FILLS = ["cream", "paper", "pink", "mint", "butter", "sky", "lilac", "peach", "soft-pink", "soft-mint", "soft-butter", "soft-sky", "soft-lilac", "soft-peach", "meadow"] as const;
const FILL_CLASS: Record<(typeof FILLS)[number], string> = {
  cream: "bg-cream",
  paper: "bg-paper",
  pink: "bg-pink",
  mint: "bg-mint",
  butter: "bg-butter",
  sky: "bg-sky",
  lilac: "bg-lilac",
  peach: "bg-peach",
  "soft-pink": "bg-soft-pink",
  "soft-mint": "bg-soft-mint",
  "soft-butter": "bg-soft-butter",
  "soft-sky": "bg-soft-sky",
  "soft-lilac": "bg-soft-lilac",
  "soft-peach": "bg-soft-peach",
  meadow: "bg-meadow",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="mb-4 font-head text-[26px]">{title}</h2>
      {children}
    </section>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border-sticker-dashed bg-paper px-5 py-[18px]">
      <h3 className="mb-3 font-head text-[16px] text-ink-2">{title}</h3>
      {children}
    </div>
  );
}

function MoodCard({ mood }: { mood: MochiMood }) {
  const ref = useRef<MochiHandle>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.play()}
      className="cursor-pointer overflow-hidden rounded-lg border-sticker bg-paper text-left shadow-lift transition-[transform,box-shadow] duration-300 ease-spring hover:-translate-y-1 hover:shadow-lift-l active:translate-y-0.5 active:shadow-none"
    >
      <div className="grid h-[180px] place-items-center border-b-[length:var(--mochi-stroke)] border-solid border-line bg-sky">
        <Mochi ref={ref} mood={mood} size={140} track />
      </div>
      <div className="px-4 py-3 font-head text-[20px]">{MOODS[mood].label}</div>
    </button>
  );
}

export function Showcase() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [mood, setMood] = useState<MochiMood>("happy");
  const [color, setColor] = useState<MochiColor>("pink");
  const [hat, setHat] = useState<MochiHat>("none");
  const [line, setLine] = useState("戳戳我，或者在右边换表情");
  const [tag, setTag] = useState("全部");
  const pokes = useRef(0);

  const switchMode = (next: "light" | "dark") => {
    document.documentElement.dataset.mode = next;
    setMode(next);
  };
  const poke = () => {
    pokes.current += 1;
    setLine(POKE_LINES[pokes.current % POKE_LINES.length]);
  };

  return (
    <main className="mx-auto max-w-[1120px] px-7 pt-11 pb-28">
      <header className="flex flex-wrap items-center gap-4">
        <Mochi size={60} track />
        <h1 className="font-head text-[36px] leading-tight">团子小镇 · 组件样张</h1>
        <DayNightSwitch mode={mode} onChange={switchMode} className="ml-auto" />
      </header>

      <Section title="团子 · 6 个表情">
        <div className="grid grid-cols-3 gap-5">
          {MOOD_LIST.map((item) => (
            <MoodCard key={item} mood={item} />
          ))}
        </div>
      </Section>

      <Section title="团子 · 试玩">
        <div className="grid grid-cols-[300px_1fr] items-center gap-6">
          <div className="relative grid h-[280px] place-items-center overflow-hidden rounded-xl border-sticker bg-sky shadow-lift">
            <Bubble className="absolute top-6 left-5">{line}</Bubble>
            <Mochi mood={mood} color={color} hat={hat} size={170} track onPoke={poke} />
          </div>
          <div className="flex flex-col gap-3">
            {[
              ["表情", MOOD_LIST.map((key) => [key, MOODS[key].label] as const), mood, setMood],
              ["颜色", Object.entries(COLORS), color, setColor],
              ["帽子", Object.entries(HATS), hat, setHat],
            ].map(([label, options, value, set]) => (
              <div key={label as string} className="flex flex-wrap items-center gap-2">
                <span className="w-10 text-[14px] text-ink-2">{label as string}</span>
                {(options as ReadonlyArray<readonly [string, string]>).map(([key, text]) => (
                  <Candy key={key} selected={value === key} onClick={() => (set as (next: string) => void)(key)}>
                    {text}
                  </Candy>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-6 rounded-lg border-sticker bg-paper px-6 py-5 shadow-lift">
          {[24, 40, 64, 120, 200].map((size) => (
            <figure key={size} className="text-center text-[12px] text-ink-2">
              <Mochi size={size} />
              <figcaption className="mt-1.5">{size}px</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="颜色">
        <div className="grid grid-cols-5 gap-3.5">
          {FILLS.map((name) => (
            <div key={name} className="overflow-hidden rounded-md border-sticker bg-paper shadow-lift-s">
              <div className={`flex h-16 items-end justify-between border-b-[length:var(--mochi-stroke)] border-solid border-line px-2 pb-1.5 ${FILL_CLASS[name]}`}>
                <span className="font-head text-[20px] text-ink">字</span>
                <span className="text-[13px] text-ink-2">次要</span>
              </div>
              <div className="px-2.5 py-1.5 font-mono text-[11px]">--mochi-{name}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[14px]">
          <span className="rounded-md bg-accent px-3 py-1 text-ink">accent · 只做图形</span>
          <span className="rounded-md bg-paper px-3 py-1 text-accent-ink">accent-ink · 链接文字</span>
          <span className="rounded-md bg-accent-ink px-3 py-1 text-on-accent">on-accent · 按钮文字</span>
          <span className="rounded-md bg-code px-3 py-1 font-mono text-code-ink">code · 代码</span>
        </div>
      </Section>

      <Section title="字体">
        <Card className="grid gap-3">
          <p className="font-head text-[48px] leading-[1.15]">团子的小窝</p>
          <p className="font-head text-[32px] leading-[1.3]">在家做一杯手冲咖啡</p>
          <p className="font-head text-[22px]">先选一包新鲜的豆子</p>
          <p className="font-body text-[17px] leading-[1.95]">秋天的早上，最适合慢慢磨一把豆子。不追求专业，只求每天那一杯能让自己开心。English mixed 2026.</p>
          <p className="text-[13px] text-ink-2">2026 年 10 月 21 日 · 约 6 分钟</p>
          <p className="font-latin text-[28px] font-bold">42 · 318 · 10/21</p>
          <p className="font-mono text-[13.5px]">const water = beans * 15;</p>
        </Card>
      </Section>

      <Section title="基础组件">
        <div className="grid grid-cols-2 gap-5">
          <Panel title="按钮">
            <div className="flex flex-wrap items-center gap-3">
              <Button>普通</Button>
              <Button variant="primary">主要</Button>
              <Button variant="accent">强调</Button>
              <Button variant="ghost">幽灵</Button>
              <Button icon="🔍" aria-label="搜索" />
              <Button disabled>禁用</Button>
            </div>
          </Panel>
          <Panel title="标签与分类">
            <div className="flex flex-wrap gap-2">
              {["全部", "生活", "编程", "读书"].map((name) => (
                <Candy key={name} selected={tag === name} onClick={() => setTag(name)}>
                  {name}
                </Candy>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone={KIND_TONES.article}>文章</Chip>
              <Chip tone={KIND_TONES.card}>卡片</Chip>
              <Chip tone={KIND_TONES.doc}>文档</Chip>
              {["咖啡", "Rust", "旅行"].map((name) => (
                <Chip key={name} tone={toneForTag(name)}>
                  #{name}
                </Chip>
              ))}
            </div>
          </Panel>
          <Panel title="输入框与气泡">
            <Input leading="🔍" trailing={<Kbd>⌘K</Kbd>} placeholder="团子帮你闻一闻……" aria-label="搜索" />
            <div className="mt-5">
              <Bubble>嗨，戳戳我也可以哦～</Bubble>
            </div>
          </Panel>
          <Panel title="卡片与便签">
            <div className="grid grid-cols-2 gap-5">
              <Card interactive>
                <b className="font-head text-[18px]">在家做一杯手冲咖啡</b>
                <p className="mt-1 text-[14px] text-ink-2">秋天的早上，最适合慢慢磨一把豆子。</p>
              </Card>
              <Note tone="mint">费曼学习法：讲给小朋友听。</Note>
            </div>
          </Panel>
        </div>
      </Section>
    </main>
  );
}
