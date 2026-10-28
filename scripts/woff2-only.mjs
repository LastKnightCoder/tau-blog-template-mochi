/**
 * PostCSS 插件：@font-face 同时列了 woff2 和 woff/ttf 时只留 woff2。
 * 所有在支持范围内的浏览器都认 woff2，去掉后备格式可以少打包约 60 个字体文件，
 * 让模板留在插件中心每包 512 个文件的上限之内。没有 woff2 的声明原样保留。
 */
const SOURCE = /url\([^)]*\)\s*format\(\s*["']?([\w-]+)["']?\s*\)/g;

function splitSources(value) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === "," && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

const formatOf = (source) => [...source.matchAll(SOURCE)][0]?.[1];

export function woff2Only() {
  return {
    postcssPlugin: "mochi-woff2-only",
    AtRule: {
      "font-face": (rule) => {
        rule.walkDecls("src", (decl) => {
          const sources = splitSources(decl.value);
          const woff2 = sources.filter((source) => formatOf(source) === "woff2");
          if (woff2.length && woff2.length < sources.length) decl.value = woff2.join(", ");
        });
      },
    },
  };
}
woff2Only.postcss = true;
