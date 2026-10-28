import { useRef, useState, type ReactNode } from "react";
import { COLORS, HATS, Mochi, MOODS, type MochiColor, type MochiHandle, type MochiHat, type MochiMood } from "@mochi/mochi";
import { Bubble, Button, Candy, Card, Chip, DayNightSwitch, Input, KIND_TONES, Kbd, toneForTag } from "@mochi/ui";

/** 开发用样张：逐个展示 token 与基础组件，不进入发布产物 */

const POKE_LINES = ["嘿嘿，好痒～", "今天也要好好写字哦", "我是糯米做的，不能吃！", "再戳就要变形啦"];
const MOOD_LIST = Object.keys(MOODS) as MochiMood[];
const SWATCHES = [
  ["paper", "bg-paper", "纸"],
  ["paper-hi", "bg-paper-hi", "亮纸"],
  ["wash", "bg-wash", "淡洗"],
  ["tint-sakura", "bg-tint-sakura", "樱花淡底"],
  ["tint-matcha", "bg-tint-matcha", "抹茶淡底"],
  ["tint-kuri", "bg-tint-kuri", "栗子淡底"],
  ["sakura", "bg-sakura", "樱花 · 插画"],
  ["matcha", "bg-matcha", "抹茶 · 插画"],
  ["kuri", "bg-kuri", "栗子 · 插画"],
  ["azuki", "bg-azuki", "豆沙 · 插画"],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="mb-5 text-[24px] font-normal tracking-[0.06em]">{title}</h2>
      {children}
    </section>
  );
}

function MoodCard({ mood }: { mood: MochiMood }) {
  const ref = useRef<MochiHandle>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.play()}
      className="cursor-pointer border-0 border-r border-b border-solid border-rule bg-paper p-0 text-left transition-colors duration-200 hover:bg-wash"
    >
      <div className="grid h-[180px] place-items-center">
        <Mochi ref={ref} mood={mood} size={130} track />
      </div>
      <div className="px-5 pb-4 text-[17px] tracking-[0.06em]">{MOODS[mood].label}</div>
    </button>
  );
}

export function Showcase() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [mood, setMood] = useState<MochiMood>("happy");
  const [color, setColor] = useState<MochiColor>("sakura");
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
    <main className="washi-paper min-h-dvh">
      <div className="mx-auto max-w-[1120px] px-14 pt-12 pb-28">
        <header className="flex flex-wrap items-center gap-4">
          <Mochi size={52} track />
          <h1 className="text-[34px] leading-tight font-normal tracking-[0.08em]">团子铺 · 组件样张</h1>
          <DayNightSwitch mode={mode} onChange={switchMode} className="ml-auto" />
        </header>

        <Section title="团子的六个表情">
          <div className="grid grid-cols-3 border-0 border-t border-l border-solid border-rule">
            {MOOD_LIST.map((item) => (
              <MoodCard key={item} mood={item} />
            ))}
          </div>
        </Section>

        <Section title="试玩">
          <div className="grid grid-cols-[320px_1fr] items-center gap-10">
            <div className="relative aspect-square">
              <span aria-hidden className="mochi-halo absolute inset-0 rounded-full" />
              <div className="absolute inset-x-0 top-[12%] flex flex-col items-center gap-3">
                <Bubble tailAlign="center">{line}</Bubble>
                <Mochi mood={mood} color={color} hat={hat} size={190} track onPoke={poke} />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                ["表情", MOOD_LIST.map((key) => [key, MOODS[key].label] as const), mood, setMood],
                ["口味", Object.entries(COLORS), color, setColor],
                ["帽子", Object.entries(HATS), hat, setHat],
              ].map(([label, options, value, set]) => (
                <div key={label as string} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-12 text-[14px] text-ink-2">{label as string}</span>
                  {(options as ReadonlyArray<readonly [string, string]>).map(([key, text]) => (
                    <Candy key={key} selected={value === key} onClick={() => (set as (next: string) => void)(key)}>
                      {text}
                    </Candy>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-end gap-8 border-0 border-t border-solid border-rule pt-8">
            {[24, 34, 64, 120, 220].map((size) => (
              <figure key={size} className="text-center text-[12px] text-ink-3">
                <Mochi size={size} />
                <figcaption className="mt-2 font-num">{size}px</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section title="颜色">
          <div className="grid grid-cols-5 gap-px overflow-hidden rounded-sm border-hair bg-rule">
            {SWATCHES.map(([token, className, name]) => (
              <div key={token} className="bg-paper">
                <div className={`flex h-20 items-end justify-between px-3 pb-2 ${className}`}>
                  <span className="text-[20px] text-ink">字</span>
                  <span className="text-[13px] text-ink-2">次要</span>
                </div>
                <div className="px-3 py-2 text-[13px]">
                  {name}
                  <span className="block font-mono text-[11px] text-ink-3">--mochi-{token}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-[14px]">
            <span className="rounded-sm bg-seal px-3 py-1 text-on-seal">店印 · 主按钮</span>
            <span className="rounded-sm px-3 py-1 text-sakura-ink">樱花墨 · 链接</span>
            <span className="rounded-sm px-3 py-1 text-matcha-ink">抹茶墨 · 提示</span>
            <span className="rounded-sm bg-code px-3 py-1 font-mono text-code-ink">code · 代码</span>
          </div>
        </Section>

        <Section title="字体">
          <div className="grid gap-4 border-0 border-t border-solid border-rule pt-6">
            <p className="text-[68px] leading-[1.12] tracking-[0.06em]">团子的小窝</p>
            <p className="text-[40px] leading-[1.35] tracking-[0.04em]">在家做一杯好喝的手冲咖啡</p>
            <p className="text-[23px] tracking-[0.02em]">先选一包新鲜的豆子</p>
            <p className="max-w-[640px] text-[17.5px] leading-[2.05]">秋天的早上，最适合慢慢磨一把豆子。不追求专业，只求每天那一杯能让自己开心。English mixed 2026.</p>
            <p className="text-[14px] text-ink-2">2026 年 10 月 21 日，约 6 分钟</p>
            <p className="font-num text-[30px]">42 318 10·21</p>
            <p className="font-mono text-[13.5px]">const water = beans * 15;</p>
          </div>
        </Section>

        <Section title="基础组件">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border-hair bg-rule">
            <div className="bg-paper p-6">
              <h3 className="mb-4 text-[14px] font-normal text-ink-3">按钮</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button>普通</Button>
                <Button variant="primary">投喂团子</Button>
                <Button variant="quiet">安静</Button>
                <Button icon="⌕" aria-label="搜索" />
                <Button disabled>禁用</Button>
              </div>
            </div>
            <div className="bg-paper p-6">
              <h3 className="mb-4 text-[14px] font-normal text-ink-3">筛选与标签</h3>
              <div className="flex flex-wrap gap-1.5">
                {["全部", "生活", "编程", "读书"].map((name) => (
                  <Candy key={name} selected={tag === name} onClick={() => setTag(name)}>
                    {name}
                  </Candy>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                <Chip tone={KIND_TONES.article}>文章</Chip>
                <Chip tone={KIND_TONES.card}>卡片</Chip>
                <Chip tone={KIND_TONES.doc}>文档</Chip>
                {["咖啡", "Rust", "旅行"].map((name) => (
                  <Chip key={name} tone={toneForTag(name)}>
                    {name}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="bg-paper p-6">
              <h3 className="mb-4 text-[14px] font-normal text-ink-3">输入框与小纸条</h3>
              <Input trailing={<Kbd>⌘K</Kbd>} placeholder="搜索文章、卡片和文档" aria-label="搜索" />
              <div className="mt-6">
                <Bubble>嗨，戳戳我也可以哦～</Bubble>
              </div>
            </div>
            <div className="bg-paper p-6">
              <h3 className="mb-4 text-[14px] font-normal text-ink-3">纸片</h3>
              <Card interactive>
                <b className="text-[18px] font-normal">在家做一杯手冲咖啡</b>
                <p className="mt-1 text-[14px] text-ink-2">秋天的早上，最适合慢慢磨一把豆子。</p>
              </Card>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
