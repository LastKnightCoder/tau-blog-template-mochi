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
    expect(cn("bg-paper", "bg-wash")).toBe("bg-wash");
    expect(cn("text-ink", "text-ink-2")).toBe("text-ink-2");
    expect(cn("text-ink-2 font-body text-[15px]", "text-sakura-ink")).toBe("font-body text-[15px] text-sakura-ink");
    expect(cn("bg-seal", "bg-ink")).toBe("bg-ink");
    expect(cn("rounded-lg", "rounded-full")).toBe("rounded-full");
    expect(cn("ease-spring", "ease-soft")).toBe("ease-soft");
    expect(cn("border-hair", "border-0")).toBe("border-0");
    expect(cn("bg-transparent text-ink-2", "bg-ink text-paper")).toBe("bg-ink text-paper");
    expect(cn("bg-ink", "bg-transparent")).toBe("bg-transparent");
    expect(cn("text-ink", "text-current")).toBe("text-current");
  });
});
