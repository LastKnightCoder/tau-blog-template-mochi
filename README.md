# 团子小镇 · Tau 博客模板

可爱风的 Tau 博客模板：站点是一座小镇，一只会看你、会被戳、会睡着的团子陪访客读文章、翻卡片、逛项目文档。

## 页面

| 地址                       | 页面                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| `/`                        | 小镇广场：三栋房子通往各分区，邮箱里是最近寄到的内容             |
| `/articles`                | 邮局：文章是一封封信，悬停盖邮戳，标签糖果筛选                   |
| `/articles/:id`            | 手帐纸：目录里的团子跟着阅读位置走，读完打个嗝                   |
| `/cards`                   | 便签屋：手帐点阵页上用胶带贴着的便签，标签罐子筛选               |
| `/cards/:id`               | 手帐纸：红毛线连着相关卡片                                       |
| `/projects/:project/:id`   | 绘本：寻宝小路目录、上一页下一页                                 |
| 其他地址                   | 迷路的团子                                                       |

地址与官方模板 `tau.blog` 相同，换模板后旧链接仍然有效。按 ⌘K（Windows 上 Ctrl K）随时搜索。

## 站点设置

在 Tau 发布页「站点设置 · 博客模板」里填写：

| 字段         | 说明                                             |
| ------------ | ------------------------------------------------ |
| 站点描述     | 首页站名下方的一段话，留空不显示                 |
| 团子的名字   | 问候语和找不到页面时用，默认「团子」             |
| 团子的颜色   | 麻薯粉、薄荷、天蓝、奶黄                         |
| 团子的口头禅 | 访客戳团子时轮流说，每行一句                     |
| 小镇动画     | 首页的云、烟囱的烟和页脚的小蜗牛，可以关掉       |

系统开启「减弱动态效果」时，所有动画会瞬间完成，团子的眼睛不再跟随鼠标。

## 开发

```sh
pnpm install --frozen-lockfile
pnpm dev      # http://127.0.0.1:5173/ 用内存夹具站点预览；/showcase.html 是组件样张
pnpm check
pnpm test
pnpm build    # 产物 output/tau.blog-mochi-<version>.zip
```

`pnpm dev` 读 `scripts/dev-fixture.mjs` 生成的内存站点，按发布协议覆盖全部五类页面；生产构建不包含夹具和样张。

`template.json` 是模板身份与站点字段的唯一来源，`scripts/build.mjs` 从这里生成 manifest，版本号取 `package.json`。构建会按插件中心的上限（512 个文件、解压 32MiB、ZIP 16MiB）检查产物，超出时直接失败。

### 在宿主里验证

在 editor 仓库里运行宿主的发布生成器，它会读这个模板的 `dist/` 生成一个真实站点并检查数据协议：

```sh
node scripts/plugins/verify-blog-template.mjs ../tau-blog-template-mochi
```

该脚本目前断言模板 id 为 `tau.blog`，需要把那一行改成比较 `template.manifest.id` 再运行。生成的站点可以用 `scripts/smoke-browser.cjs` 在 Electron 里逐页走一遍（用法见文件开头）。

## 代码结构

| 路径                    | 内容                                                                     |
| ----------------------- | ------------------------------------------------------------------------ |
| `src/data/`             | 读清单与页面数据，把 ContentRef 换成本模板的地址；站点字段的兜底         |
| `src/app/`              | 入口外壳：路由、页头页脚、正文渲染、搜索、日夜、状态页、团子雨           |
| `src/pages/`            | 五类页面与目录、表情按钮、阅读进度                                       |
| `src/mochi/`            | `<Mochi />` 组件、眼睛跟随与眨眼、空闲检测                               |
| `src/ui/`               | 基础组件：Button、Candy、Chip、Input、Bubble、Card、Note、DayNightSwitch |
| `src/styles/tokens.css` | 颜色、字体、描边、投影、动效 token 与 `--tau-*` 桥接                     |
| `src/styles/scene.css`  | 场景纹理、keyframes 与正文元素外观                                       |
| `src/styles/fonts.css`  | 站酷快乐体、霞鹜文楷屏幕版、Baloo 2、JetBrains Mono                      |

### 颜色规则

整站是一本水彩手帐。文字一律用墨色（`text-ink` / `text-ink-2`），`text-ink-3` 只用于装饰线和禁用态。

- 填充分两档：大面积（便签纸、高亮区、选中态）用淡色组 `bg-soft-*`；马卡龙色 `bg-pink` 等只做小面积点缀和胶带。天空、草地、绘本封面用 `scene.css` 里的水彩渐变。
- 描边分两级：纸面（页面容器、卡片、信纸、便签、弹窗）用 `border-sheet` + `shadow-sheet`，细而浅；贴纸（按钮、标签糖果、开关、角标、团子与插画）用 `border-sticker` + `shadow-lift-*` 墨线硬投影。
- 便签用同色和纸胶带（`mochi-washi` 加 `mochi-washi-<色>`）贴在纸上，不用图钉。
- 强调色分两种：`bg-accent` 只画角标、毛线这类图形，链接与白字按钮用 `accent-ink`。

Tailwind 默认色板和圆角已经关闭，只能用 `tokens.css` 里登记的词。新增 token 时同步 `src/ui/cn.ts` 的词表，`cn.test.ts` 会检查两者一致；`tokens.test.ts` 在明暗两套配色下检查对比度和 `--tau-*` 是否齐全。

### 字体与文件数

正文渲染器自带约 360 个文件（代码高亮语法、KaTeX 字体）。为了留在插件中心 512 个文件的上限内：站酷快乐体用简体整字库单文件（只用于标题）；`scripts/woff2-only.mjs` 去掉 `@font-face` 里的 woff/ttf 后备格式，构建脚本再删掉没人引用的字体文件。

### 团子

```tsx
import { Mochi } from "@mochi/mochi";

<Mochi mood="curious" color="mint" hat="night" size={120} track onPoke={() => {}} />;
```

| 参数     | 说明                                                          |
| -------- | ------------------------------------------------------------- |
| `mood`   | `happy` `wink` `curious` `sleepy` `dizzy` `shy`，默认 `happy` |
| `color`  | 身体颜色 `pink` `mint` `sky` `butter`，五官与描边不变         |
| `hat`    | `none` `night` `post` `grad` `santa`                          |
| `size`   | 宽度（px），小于 32 时自动换成简化版                          |
| `track`  | 眼睛跟随鼠标                                                  |
| `blink`  | 随机眨眼，默认开启                                            |
| `onPoke` | 传入后团子渲染为按钮，点击播放当前表情的招牌动作              |
| `label`  | 无障碍名称；不传且不可点击时视为装饰，对读屏隐藏              |

通过 `ref` 拿到 `play(act?)` 可以随时播放招牌动作。全页团子共用一个指针监听和眨眼定时器。
