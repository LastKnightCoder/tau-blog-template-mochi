import { afterEach, expect, it } from "vitest";
import { click, render } from "@mochi/test-utils";
import { Showcase } from "./Showcase";

afterEach(() => {
  document.documentElement.dataset.mode = "light";
});

it("样张渲染全部表情，日夜开关写回 data-mode，试玩区可以换表情", () => {
  const { container } = render(<Showcase />);
  expect(container.querySelectorAll('[data-mood="sleepy"]').length).toBeGreaterThan(0);
  expect(new Set([...container.querySelectorAll("svg[data-mood]")].map((svg) => svg.getAttribute("data-mood"))).size).toBe(6);

  click(container.querySelector('[role="switch"]')!);
  expect(document.documentElement.dataset.mode).toBe("dark");

  const dizzy = [...container.querySelectorAll("button[aria-pressed]")].find((button) => button.textContent === "晕晕")!;
  click(dizzy);
  expect(dizzy.getAttribute("aria-pressed")).toBe("true");
  expect(container.querySelector('button[aria-label="团子 · 晕晕"]')).not.toBeNull();
});
