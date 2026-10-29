# 团子铺 · Tau 博客模板

可爱但安静的 Tau 博客模板：把博客当成一家和果子小店，店主是一只会看你、会被戳、会打盹的团子。

## 页面

| 地址                     | 页面                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `/`                      | 店面：站名、坐在樱色圆上的团子、三个分区的菜单、最近做好的 |
| `/articles`              | 文章目录：左边可折叠、可搜索的标签树，右边按年分段，40 篇一批 |
| `/articles/:id`          | 文章：左边目录与读到几成，右边页边上打盹的团子，读完会醒   |
| `/cards`                 | 卡片：同一套标签树，右边按月分格的点心盒，40 张一批         |
| `/cards/:id`             | 卡片详情：与文章同一套排版，右栏是连着的卡片               |
| `/projects/:project/:id` | 项目文档：细线目录标出读过的页，上一页下一页               |
| 其他地址                 | 晕乎乎的团子                                               |

地址与官方模板 `tau.blog` 相同，换模板后旧链接仍然有效。按 ⌘K（Windows 上 Ctrl K）随时搜索。

## 站点设置

在 Tau 发布页「站点设置 · 博客模板」里填写：

| 字段           | 说明                                              |
| -------------- | ------------------------------------------------- |
| 站点描述       | 首页站名下方的一段话，留空不显示                  |
| 团子的名字     | 店印、问候和找不到页面时用，默认「团子」          |
| 团子的颜色     | 樱花、抹茶、白玉、栗子                            |
| 团子的口头禅   | 访客戳团子时轮流说，每行一句                      |
| 团子的小动作   | 首页团子眨眼、跟着鼠标看；关掉后团子保持静止      |

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

| 路径                    | 内容                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| `src/data/`             | 读清单与页面数据，把 ContentRef 换成本模板的地址；站点字段的兜底   |
| `src/app/`              | 入口外壳：路由、页头页脚、正文渲染、搜索、日夜、状态页、团子雨     |
| `src/pages/`            | 五类页面与目录、表情按钮、阅读进度、分区小插画                     |
| `src/mochi/`            | `<Mochi />` 组件、眼睛跟随与眨眼、空闲检测                         |
| `src/ui/`               | 基础组件：Button、Candy、Chip、Input、Bubble、Card、DayNightSwitch |
| `src/styles/tokens.css` | 颜色、字体、动效 token 与 `--tau-*` 桥接                           |
| `src/styles/scene.css`  | keyframes 与正文元素外观                                           |
| `src/styles/fonts.css`  | 霞鹜文楷屏幕版、JetBrains Mono                                     |

### 设计规则

界面安静，团子是唯一的主角。

- 分隔只用一像素细线（`border-hair` / `border-rule`），不用投影；只有浮层（搜索、项目下拉、团子的小纸条）用一层 `shadow-float`。
- 樱花、抹茶、栗子、豆沙四色（`bg-sakura` 等）只画插画、图案和标签色点；要放文字的底色用 `bg-tint-*` 或 `bg-wash`。
- 文字一律用墨色（`text-ink` / `text-ink-2`），`text-ink-3` 只用于日期、页脚这类次要信息。链接与强调文字用 `text-sakura-ink`。
- 朱红店印 `bg-seal` 是唯一的强调色，只用在当前导航的下划线、目录当前章节、店印与主按钮。
- 全站一套霞鹜文楷，标题靠字距与留白，不加粗；数字用系统衬线（`font-num`）。
- 动效：页面只淡入；首页站名逐字落下是唯一的编排动作；弹性曲线只给团子和被按下的东西。

Tailwind 默认色板、圆角和投影已经关闭，只能用 `tokens.css` 里登记的词。新增 token 时同步 `src/ui/cn.ts` 的词表，`cn.test.ts` 会检查两者一致；`tokens.test.ts` 在明暗两套配色下检查对比度和 `--tau-*` 是否齐全。

### 字体与文件数

正文渲染器自带约 360 个文件（代码高亮语法、KaTeX 字体），插件中心每包上限 512 个。全站只用一套中文字体，按字符切片加载；`scripts/woff2-only.mjs` 去掉 `@font-face` 里的 woff/ttf 后备格式，构建脚本再删掉没人引用的字体文件。加字体前先看一眼构建输出的文件数。

### 团子

```tsx
import { Mochi } from "@mochi/mochi";

<Mochi mood="curious" color="matcha" hat="night" size={120} track onPoke={() => {}} />;
```

| 参数     | 说明                                                          |
| -------- | ------------------------------------------------------------- |
| `mood`   | `happy` `wink` `curious` `sleepy` `dizzy` `shy`，默认 `happy` |
| `color`  | 口味 `sakura` `matcha` `shiro` `kuri`，五官与描边不变         |
| `hat`    | `none`（头顶一片抹茶叶）`night` `post` `grad` `santa`         |
| `size`   | 宽度（px），小于 32 时自动换成简化版                          |
| `track`  | 眼睛跟随鼠标                                                  |
| `blink`  | 随机眨眼，默认开启                                            |
| `onPoke` | 传入后团子渲染为按钮，点击播放当前表情的招牌动作              |
| `label`  | 无障碍名称；不传且不可点击时视为装饰，对读屏隐藏              |

通过 `ref` 拿到 `play(act?)` 可以随时播放招牌动作。全页团子共用一个指针监听和眨眼定时器。
