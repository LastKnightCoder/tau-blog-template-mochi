import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach } from "vitest";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

afterEach(() => {
  while (mounted.length) mounted.pop()!();
});

/** 渲染到 document 上并在每个用例后自动卸载 */
export function render(node: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(node));
  mounted.push(() => {
    act(() => root.unmount());
    container.remove();
  });
  return {
    container,
    rerender: (next: ReactNode) => act(() => root.render(next)),
  };
}

export function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}
