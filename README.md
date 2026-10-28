# 团子小镇 · Tau 博客模板

可爱风的 Tau 博客模板：站点是一座小镇，主角是一只会看你、会被戳、会睡着的团子。

目前完成了设计系统：token、字体、团子组件和基础组件。页面模板（首页、文章、卡片、项目文档、搜索）尚未开始，这一版还不能打包发布。

```sh
pnpm install --frozen-lockfile
pnpm dev      # 打开 http://127.0.0.1:5173/showcase.html 查看组件样张
pnpm check
pnpm test
pnpm build
```

## 目录

| 路径                     | 内容                                                                     |
| ------------------------ | ------------------------------------------------------------------------ |
| `src/styles/tokens.css`  | 颜色、字体、描边、投影、动效 token，以及给正文渲染器的 `--tau-*` 桥接    |
| `src/styles/fonts.css`   | 站酷快乐体、霞鹜文楷屏幕版、Baloo 2、JetBrains Mono，均按字符切片加载    |
| `src/styles/mochi.css`   | 团子 SVG 内部的呼吸、眨眼、道具动画与 6 个招牌动作                       |
| `src/mochi/`             | `<Mochi />` 组件                                                         |
| `src/ui/`                | 基础组件：Button、Candy、Chip、Input、Bubble、Card、Note、DayNightSwitch |
| `src/showcase/`          | 开发用样张，不进入发布产物                                               |

## 颜色规则

马卡龙色只做填充，文字一律用墨色（`text-ink` / `text-ink-2`）。`text-ink-3` 只用于装饰线和禁用态。强调色分两种：`bg-accent` 只画图钉、角标这类图形，链接与白字按钮用 `accent-ink`。

Tailwind 默认色板和圆角已经关闭，只能使用 `tokens.css` 里登记的词。新增 token 时同步 `src/ui/cn.ts` 的词表，`cn.test.ts` 会检查两者一致；`tokens.test.ts` 在明暗两套配色下检查对比度和 `--tau-*` 是否齐全。

## 团子

```tsx
import { Mochi } from "@mochi/mochi";

<Mochi mood="curious" color="mint" hat="night" size={120} track onPoke={() => {}} />;
```

| 参数     | 说明                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| `mood`   | `happy` `wink` `curious` `sleepy` `dizzy` `shy`，默认 `happy`                   |
| `color`  | 身体颜色 `pink` `mint` `sky` `butter`，五官与描边不变                           |
| `hat`    | `none` `night` `post` `grad` `santa`                                            |
| `size`   | 宽度（px），小于 32 时自动换成简化版                                            |
| `track`  | 眼睛跟随鼠标                                                                    |
| `blink`  | 随机眨眼，默认开启                                                              |
| `onPoke` | 传入后团子渲染为按钮，点击播放当前表情的招牌动作                                |
| `label`  | 无障碍名称；不传且不可点击时视为装饰，对读屏隐藏                                |

通过 `ref` 拿到 `play(act?)` 可以在任何时候播放招牌动作，例如读完文章时让团子跳一下。全页团子共用一个指针监听和眨眼定时器；系统开启「减弱动态效果」时，眼睛不跟随、不眨眼，所有动画瞬时完成。
