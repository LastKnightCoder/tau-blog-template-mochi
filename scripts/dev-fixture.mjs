/**
 * 开发服务器用的内存站点：按发布协议生成清单、页面数据和搜索索引，覆盖五类页面。
 * 生产构建不包含本文件。
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PREFIX = "/__mochi_demo/";
const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 28, 2);
const files = new Map();

const write = (name, value) => {
  const body = JSON.stringify(value);
  const integrity = createHash("sha256").update(body).digest("hex");
  // 数据客户端按文件名里的完整摘要校验内容
  const file = `${name}.${integrity}.json`;
  files.set(PREFIX + file, body);
  return { file, integrity };
};

const text = (value, marks = {}) => ({ type: "formatted", text: value, ...marks });
const paragraph = (...children) => ({ type: "paragraph", children: children.map((c) => (typeof c === "string" ? text(c) : c)) });
const header = (level, value) => ({ type: "header", level, children: [text(value)] });
const quote = (value) => ({ type: "blockquote", children: [paragraph(value)] });
const code = (language, source) => ({ type: "code-block", language, code: source, uuid: `code-${source.length}`, children: [text("")] });
const bullets = (...items) => ({ type: "bulleted-list", children: items.map((item) => ({ type: "list-item", children: [paragraph(item)] })) });
const link = (contentType, refId, label) => ({
  type: "content-link",
  contentType,
  refId,
  contentTitle: label,
  children: [text(label)],
});

const ref = (type, id, projectId) => ({ key: type === "doc" ? `doc:${projectId}:${id}` : `${type}:${id}`, type, id });

const articles = [
  {
    id: 1,
    title: "在家做一杯好喝的手冲咖啡",
    tags: ["生活", "咖啡"],
    days: 3,
    content: [
      paragraph("秋天的早上，最适合慢慢磨一把豆子。这篇是我练了三个月后的", text("一些小心得", { bold: true }), "，不追求专业，只求每天那一杯能让自己开心。"),
      header(2, "先选一包新鲜的豆子"),
      paragraph("烘焙日期在两周以内最好。浅烘的果酸更明亮，中深烘更像巧克力和坚果。"),
      quote("小提示：豆子开封后用带单向阀的罐子装，放在阴凉处，不要进冰箱。"),
      header(2, "水温和粉水比"),
      paragraph("我常用 1:15 的粉水比，15 克粉配 225 克水，水温 92 度左右。"),
      code("TypeScript", "// 按豆子重量算出注水量\nconst water = (beans: number, ratio = 15) => beans * ratio;\nconsole.log(water(15)); // 225"),
      header(2, "注水的节奏"),
      bullets("先用 30 克水闷蒸 30 秒", "分三段注水，每段等水位降到一半", "总时间控制在两分半到三分钟"),
      paragraph("如果太苦，就把研磨调粗一点；太酸，就调细一点。相关的卡片：", link("card", 1, "费曼学习法"), "。"),
      header(2, "写在最后"),
      paragraph("好喝的咖啡没有标准答案。记录下每一次的参数和感受，慢慢就会找到属于自己的那一杯。"),
    ],
  },
  {
    id: 2,
    title: "第一次用 Rust 写命令行工具",
    tags: ["编程", "Rust"],
    days: 28,
    content: [paragraph("从 cargo new 到发布到 crates.io，记录一个周末里踩过的坑：借用检查器、错误处理，以及 clap 的派生宏。")],
  },
  {
    id: 3,
    title: "给阳台的薄荷换了个大盆",
    tags: ["生活", "植物"],
    days: 44,
    content: [paragraph("薄荷长得太快了，根都从盆底钻出来。换盆那天顺便学会了扦插，现在阳台有五盆小薄荷。")],
  },
];

const cards = [
  { id: 1, tags: ["思考/学习"], days: 16, body: "费曼学习法的核心只有一句话：如果你不能用简单的话把一件事讲给小朋友听，说明你还没真正懂它。", links: [2, 4] },
  { id: 2, tags: ["思考/学习"], days: 33, body: "间隔重复：在快忘记的时候复习，记得最牢。", links: [1] },
  { id: 3, tags: ["编程"], days: 18, body: "Rust 的所有权其实就是「谁负责收拾房间」：同一时间只能有一个主人，借出去要按时还。", links: [] },
  { id: 4, tags: ["思考/写作"], days: 25, body: "写不下去的时候，先写一个糟糕的版本。改比写容易得多。", links: [1] },
  { id: 5, tags: ["读书"], days: 29, body: "《小王子》：「正是你为你的玫瑰花费的时间，才使你的玫瑰变得如此重要。」", links: [] },
  { id: 6, tags: ["生活"], days: 22, body: "薄荷扦插：剪下 10 厘米带节的枝条，泡水一周就会长根。", links: [] },
];

const PROJECT = 12;
const docs = [
  { id: 33, title: "开始之前", body: "Tau 是一个本地优先的写作工具。这本小册子带你从第一篇文档走到发布博客。" },
  { id: 34, title: "卡片与双链", body: "卡片是 Tau 里最小的思考单位。一张卡片只讲一件事，写完之后用双链把它和别的卡片连起来。" },
  { id: 35, title: "发布博客", body: "在发布页选一个博客模板，填好站点设置，点一下发布就好。" },
];

const time = (days) => NOW - days * DAY;
const items = [];
const meta = (type, publishTime) => ({ type, publishTime });
const register = (key, type, extra, payload) => {
  const { file, integrity } = write(key.replace(/[:]/g, "-"), { version: 1, key, ...payload });
  items.push({ key, type, title: extra.title, data: file, integrity, ...extra });
};

for (const article of articles) {
  register(`article:${article.id}`, "article", { id: article.id, title: article.title }, {
    meta: meta("article", time(article.days)),
    links: { "card:1": ref("card", 1) },
    content: {
      id: article.id,
      title: article.title,
      author: "团子",
      tags: article.tags,
      createTime: time(article.days),
      updateTime: time(article.days - (article.id === 1 ? 3 : 0)),
      content: article.content,
    },
  });
}

for (const card of cards) {
  register(`card:${card.id}`, "card", { id: card.id, title: card.body.slice(0, 16) }, {
    meta: meta("card", time(card.days)),
    content: {
      id: card.id,
      tags: card.tags,
      createTime: time(card.days),
      updateTime: time(card.days),
      content: [paragraph(card.body)],
      linkedCards: card.links.map((id) => {
        const target = cards.find((item) => item.id === id);
        return { id, target: ref("card", id), summary: target.body, tags: target.tags };
      }),
    },
  });
}

docs.forEach((doc, index) => {
  const turn = (other) => other && { title: other.title, target: ref("doc", other.id, PROJECT) };
  register(`doc:${PROJECT}:${doc.id}`, "doc", { id: doc.id, projectId: PROJECT, title: doc.title }, {
    meta: meta("doc", time(10)),
    content: {
      id: doc.id,
      projectId: PROJECT,
      title: doc.title,
      breadcrumb: [{ label: "Tau 指南" }, { label: doc.title, target: ref("doc", doc.id, PROJECT) }],
      prevPage: turn(docs[index - 1]),
      nextPage: turn(docs[index + 1]),
      createTime: time(10),
      updateTime: time(10),
      content: [paragraph(doc.body), header(2, "小贴士"), paragraph("在任意位置输入 [[ 就能搜索并链接到另一张卡片。")],
    },
  });
});

const summary = (nodes) => nodes.flatMap((node) => node.children ?? []).map((child) => child.text ?? "").join("").slice(0, 80);
const listItems = {
  article: articles.map((a) => ({ id: a.id, title: a.title, summary: summary(a.content), target: ref("article", a.id), tags: a.tags, createTime: time(a.days) })),
  card: cards.map((c) => ({ id: c.id, summary: c.body, target: ref("card", c.id), tags: c.tags, createTime: time(c.days) })),
};
for (const [type, title] of [["article", "全部文章"], ["card", "全部卡片"]]) {
  register(`list:${type}`, "list", { collectionType: type, title }, {
    meta: meta("list", NOW),
    content: { title, type, items: listItems[type] },
  });
}

register("home", "home", { title: "首页" }, {
  meta: meta("home", NOW),
  content: {
    timeline: [
      ...listItems.article.map((item) => ({ ...item, type: "article", publishTime: item.createTime })),
      ...listItems.card.map((item) => ({ ...item, type: "card", publishTime: item.createTime })),
      { type: "doc", id: 34, title: "Tau 指南 · 卡片与双链", summary: docs[1].body, target: ref("doc", 34, PROJECT), tags: [], publishTime: time(10) },
    ].sort((a, b) => b.publishTime - a.publishTime),
    stats: { articles: articles.length, cards: cards.length },
    docStats: { projects: 1 },
  },
});

const search = write("search", {
  version: 1,
  documents: [
    ...articles.map((a) => ({ ...ref("article", a.id), title: a.title, summary: summary(a.content), content: JSON.stringify(a.content), tags: a.tags })),
    ...cards.map((c) => ({ ...ref("card", c.id), title: c.body.slice(0, 16), summary: c.body, content: c.body, tags: c.tags })),
    ...docs.map((d) => ({ ...ref("doc", d.id, PROJECT), title: d.title, summary: d.body, content: d.body, tags: [] })),
  ],
});

const tagCount = (prefix) => cards.filter((card) => card.tags.some((tag) => tag === prefix || tag.startsWith(`${prefix}/`))).length;
const here = typeof __dirname === "string" ? __dirname : dirname(fileURLToPath(import.meta.url));
const template = JSON.parse(readFileSync(resolve(here, "../template.json"), "utf8"));
const fieldDefaults = Object.fromEntries(template.siteFields.map((field) => [field.key, field.default ?? (field.type === "switch" ? false : "")]));

const manifest = write("site", {
  version: 1,
  site: {
    title: "团子的小窝",
    basePath: "/",
    fields: { ...fieldDefaults, description: "我在这里写字、记卡片、整理做过的小项目。慢慢写，慢慢长大。" },
  },
  search: { data: search.file, integrity: search.integrity },
  items,
  collections: [{ type: "project", label: "项目", items: [{ id: PROJECT, title: "Tau 指南", target: ref("doc", 33, PROJECT), kind: "project" }] }],
  cardTagTree: [
    { tag: "思考", count: tagCount("思考"), cards: [], children: [
      { tag: "学习", count: tagCount("思考/学习"), cards: [] },
      { tag: "写作", count: tagCount("思考/写作"), cards: [] },
    ] },
    { tag: "编程", count: tagCount("编程"), cards: [] },
    { tag: "生活", count: tagCount("生活"), cards: [] },
    { tag: "读书", count: tagCount("读书"), cards: [] },
  ],
  projectTrees: {
    [PROJECT]: [
      { title: "起步", children: [{ title: docs[0].title, target: ref("doc", 33, PROJECT) }] },
      { title: "写作", children: [{ title: docs[1].title, target: ref("doc", 34, PROJECT) }] },
      { title: "发布", children: [{ title: docs[2].title, target: ref("doc", 35, PROJECT) }] },
    ],
  },
});

export const demoData = { files, manifestUrl: PREFIX + manifest.file };
