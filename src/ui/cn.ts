import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * 模板自定义的词：tailwind-merge 默认不认识，会把 text-ink-2 与 text-head 之类误判为同组而互删。
 * 与 tokens.css 的 @theme 词表保持一致，cn.test.ts 守护。
 */
export const THEME_WORDS = {
  color: [
    "cream", "paper", "ink", "ink-2", "ink-3", "line", "pink", "mint", "butter", "sky", "lilac",
    "peach", "cork", "hill", "accent", "accent-ink", "on-accent", "glow", "sun", "moon", "night-sky", "code",
    "code-ink", "shadow", "white",
  ],
  font: ["head", "latin", "body", "mono"],
  shadow: ["lift-s", "lift", "lift-l"],
  ease: ["spring", "soft", "drop"],
  radius: ["sm", "md", "lg", "xl"],
} as const;

const twMerge = extendTailwindMerge({
  override: {
    theme: {
      color: [...THEME_WORDS.color],
      font: [...THEME_WORDS.font],
      shadow: [...THEME_WORDS.shadow],
      ease: [...THEME_WORDS.ease],
      radius: [...THEME_WORDS.radius],
    },
  },
  extend: {
    classGroups: {
      "border-w": ["border-sticker", "border-sticker-dashed"],
    },
  },
});

/** 组件默认类允许调用方 className 覆盖时使用：后写的同属性类胜出 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
