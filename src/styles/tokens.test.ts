import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const requirePackage = createRequire(import.meta.url);
const editorCss = readFileSync(requirePackage.resolve("@tau/blog/styles.css"), "utf8");
// 与 global.css 的引入顺序一致：scale.css 在前，tokens.css 覆盖字体栈
const tokensCss =
  readFileSync(requirePackage.resolve("@tau/blog/theme/scale.css"), "utf8") +
  readFileSync(resolve(import.meta.dirname, "tokens.css"), "utf8");

/** 只收集指定选择器里的自定义属性，后声明覆盖先声明 */
function collect(css: string, selector: string) {
  const values: Record<string, string> = {};
  postcss.parse(css).walkRules((rule) => {
    if (!postcss.list.comma(rule.selector).some((part) => part.trim() === selector)) return;
    rule.walkDecls(/^--/, (decl) => {
      values[decl.prop] = decl.value;
    });
  });
  return values;
}

function palette(mode: "light" | "dark") {
  const values = { ...collect(tokensCss, ":root"), ...(mode === "dark" ? collect(tokensCss, ':root[data-mode="dark"]') : {}) };
  const read = (name: string, seen = new Set<string>()): string => {
    const raw = values[name];
    if (raw === undefined || seen.has(name)) return "";
    return raw.replace(/var\((--[\w-]+)\)/g, (_, next: string) => read(next, new Set([...seen, name])));
  };
  return read;
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const FILLS = ["pink", "mint", "butter", "sky", "lilac", "peach", "cork", "hill"];
const BODIES = ["pink", "mint", "sky", "butter"];
const MODES = ["light", "dark"] as const;

describe("--tau-* 桥接", () => {
  const required = [...new Set(editorCss.match(/--tau-[\w-]+(?=\s*:)/g))];

  for (const mode of MODES) {
    it(`${mode}：正文渲染器需要的 --tau-* 全部有值`, () => {
      const read = palette(mode);
      expect(required.filter((name) => !read(name))).toEqual([]);
    });
  }
});

describe("对比度（WCAG 2.1）", () => {
  for (const mode of MODES) {
    const read = palette(mode);

    it(`${mode}：墨色与次要墨在底色和所有填充色上 ≥ 4.5`, () => {
      const backgrounds = ["cream", "paper", ...FILLS].map((name) => read(`--mochi-${name}`));
      for (const ink of ["--mochi-ink", "--mochi-ink-2"]) {
        for (const bg of backgrounds) expect(contrast(read(ink), bg), `${ink} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`${mode}：强调文字与按钮文字 ≥ 4.5`, () => {
      expect(contrast(read("--mochi-accent-ink"), read("--mochi-paper"))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(read("--mochi-accent-ink"), read("--mochi-cream"))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(read("--mochi-on-accent"), read("--mochi-accent-ink"))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(read("--mochi-code-ink"), read("--mochi-code"))).toBeGreaterThanOrEqual(4.5);
    });

    it(`${mode}：描边与强调图形对底色 ≥ 3`, () => {
      for (const bg of ["--mochi-cream", "--mochi-paper"]) {
        expect(contrast(read("--mochi-line"), read(bg))).toBeGreaterThanOrEqual(3);
        expect(contrast(read("--mochi-accent"), read(bg))).toBeGreaterThanOrEqual(3);
      }
    });

    it(`${mode}：团子五官在每种身体颜色上 ≥ 4.5`, () => {
      for (const body of BODIES) {
        expect(contrast(read("--mochi-face"), read(`--mochi-body-${body}`))).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`${mode}：正文用的状态色在纸面和对应浅底上 ≥ 4.5`, () => {
      for (const [ink, soft] of [
        ["--tau-ok", "--tau-ok-soft"],
        ["--tau-warn", "--tau-warn-soft"],
        ["--tau-danger", "--tau-danger-soft"],
        ["--tau-info", "--tau-info-soft"],
        ["--tau-tag-3", "--tau-tag-3-soft"],
      ]) {
        expect(contrast(read(ink), read("--mochi-paper")), `${ink} on paper`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(read(ink), read(soft)), `${ink} on ${soft}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
