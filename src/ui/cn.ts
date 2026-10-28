import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * 模板自定义的词：tailwind-merge 默认不认识，会把 text-ink-2 与 text-[15px] 之类误判为同组而互删。
 * 与 tokens.css 的 @theme 词表保持一致，cn.test.ts 守护。
 */
export const THEME_WORDS = {
  color: [
    "paper", "paper-hi", "wash", "ink", "ink-2", "ink-3", "rule", "rule-strong",
    "sakura", "matcha", "kuri", "azuki", "tint-sakura", "tint-matcha", "tint-kuri",
    "sakura-ink", "matcha-ink", "seal", "on-seal", "glow", "code", "code-ink", "white",
  ],
  font: ["body", "num", "mono"],
  shadow: ["float"],
  ease: ["soft", "spring"],
  radius: ["xs", "sm", "md", "lg"],
} as const;

/** Tailwind 不经 @theme 也有的颜色词；覆盖词表时漏掉它们，bg-transparent 就删不掉 */
const BUILTIN_COLORS = ["transparent", "current", "inherit"];

const twMerge = extendTailwindMerge({
  override: {
    theme: {
      color: [...THEME_WORDS.color, ...BUILTIN_COLORS],
      font: [...THEME_WORDS.font],
      shadow: [...THEME_WORDS.shadow],
      ease: [...THEME_WORDS.ease],
      radius: [...THEME_WORDS.radius],
    },
  },
  extend: {
    classGroups: {
      "border-w": ["border-hair"],
    },
  },
});

/** 组件默认类允许调用方 className 覆盖时使用：后写的同属性类胜出 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
