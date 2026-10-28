import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { cn, THEME_WORDS } from "./cn";

const tokensCss = readFileSync(resolve(import.meta.dirname, "../styles/tokens.css"), "utf8");
const declared = (prefix: string) =>
  [...tokensCss.matchAll(new RegExp(`^\\s*--${prefix}-([\\w-]+):`, "gm"))]
    .map((match) => match[1])
    .filter((word) => word !== "*");

describe("cn", () => {
  it("词表与 tokens.css 的 @theme 一致", () => {
    expect([...THEME_WORDS.color].sort()).toEqual(declared("color").sort());
    expect([...THEME_WORDS.font].sort()).toEqual(declared("font").sort());
    expect([...THEME_WORDS.radius].sort()).toEqual(declared("radius").sort());
    expect([...THEME_WORDS.ease].sort()).toEqual(declared("ease").sort());
    expect([...THEME_WORDS.shadow].sort()).toEqual(declared("shadow").sort());
  });

  it("同属性后写胜出，不同属性互不影响", () => {
    expect(cn("bg-paper", "bg-butter")).toBe("bg-butter");
    expect(cn("text-ink", "text-ink-2")).toBe("text-ink-2");
    expect(cn("text-ink-2 font-head text-[15px]", "text-accent-ink")).toBe("font-head text-[15px] text-accent-ink");
    expect(cn("shadow-lift-s", "shadow-lift-l")).toBe("shadow-lift-l");
    expect(cn("rounded-lg", "rounded-full")).toBe("rounded-full");
    expect(cn("ease-spring", "ease-soft")).toBe("ease-soft");
    expect(cn("border-sticker", "border-sticker-dashed")).toBe("border-sticker-dashed");
  });
});
