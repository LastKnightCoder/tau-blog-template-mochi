import { describe, expect, it, vi } from "vitest";
import { click, render } from "@mochi/test-utils";
import { Bubble, Button, Candy, Card, Chip, DayNightSwitch, Input, toneForTag } from "./index";

describe("Button", () => {
  it("默认是 type=button，不会意外提交表单", () => {
    const submit = vi.fn((event: Event) => event.preventDefault());
    const { container } = render(
      <form onSubmit={(event) => submit(event.nativeEvent)}>
        <Button>普通</Button>
      </form>,
    );
    click(container.querySelector("button")!);
    expect(submit).not.toHaveBeenCalled();
  });

  it("主按钮是店印色，调用方 className 可以覆盖默认类", () => {
    const { container } = render(
      <>
        <Button variant="primary">投喂团子</Button>
        <Button variant="primary" className="bg-ink">
          覆盖
        </Button>
      </>,
    );
    const [primary, override] = container.querySelectorAll("button");
    expect(primary.className).toContain("bg-seal");
    expect(override.className).toContain("bg-ink");
    expect(override.className).not.toContain("bg-seal");
  });

  it("只有图标时是圆形", () => {
    const button = render(<Button icon="🔍" aria-label="搜索" />).container.querySelector("button")!;
    expect(button.className).toContain("size-9");
    expect(button.getAttribute("aria-label")).toBe("搜索");
  });
});

describe("Candy 与 Chip", () => {
  it("筛选胶囊用 aria-pressed 表示选中，选中时墨底反白", () => {
    const { container } = render(
      <>
        <Candy selected>全部</Candy>
        <Candy>生活</Candy>
      </>,
    );
    const [on, off] = container.querySelectorAll("button");
    expect(on.getAttribute("aria-pressed")).toBe("true");
    expect(on.className).toContain("bg-ink");
    expect(on.className).not.toContain("bg-transparent");
    expect(off.getAttribute("aria-pressed")).toBe("false");
  });

  it("同一个标签永远落到同一种颜色，色点只是装饰", () => {
    expect(toneForTag("咖啡")).toBe(toneForTag("咖啡"));
    const tones = new Set(["生活", "编程", "读书", "设计", "思考", "咖啡", "Rust", "旅行"].map(toneForTag));
    expect(tones.size).toBeGreaterThan(2);
    const chip = render(<Chip tone={toneForTag("咖啡")}>咖啡</Chip>).container.firstElementChild!;
    expect(chip.textContent).toBe("咖啡");
    expect(chip.querySelector("i")!.getAttribute("aria-hidden")).toBe("true");
    expect(chip.querySelector("i")!.className).toContain(`bg-${toneForTag("咖啡")}`);
  });
});

describe("Input", () => {
  it("点击外框聚焦输入框，属性透传给 input", () => {
    const { container } = render(<Input leading="🔍" placeholder="找点什么" aria-label="搜索" />);
    const input = container.querySelector("input")!;
    expect(input.placeholder).toBe("找点什么");
    expect(input.closest("label")).not.toBeNull();
  });
});

describe("Bubble 与 Card", () => {
  it("气泡内容变化会被读屏播报", () => {
    expect(render(<Bubble>嗨</Bubble>).container.firstElementChild!.getAttribute("role")).toBe("status");
  });

  it("可交互的纸才有悬停换色", () => {
    const { container } = render(
      <>
        <Card>静态</Card>
        <Card interactive>可点</Card>
      </>,
    );
    const [still, live] = container.children;
    expect(still.className).not.toContain("hover:bg-wash");
    expect(live.className).toContain("hover:bg-wash");
  });
});

describe("DayNightSwitch", () => {
  it("是一个开关，点击切换到另一个模式，图标跟着换", () => {
    const change = vi.fn();
    const { container, rerender } = render(<DayNightSwitch mode="light" onChange={change} />);
    const button = container.querySelector("button")!;
    expect(button.getAttribute("role")).toBe("switch");
    expect(button.getAttribute("aria-checked")).toBe("false");
    expect(button.querySelector("circle")).not.toBeNull();
    click(button);
    expect(change).toHaveBeenCalledWith("dark");
    rerender(<DayNightSwitch mode="dark" onChange={change} />);
    expect(button.getAttribute("aria-checked")).toBe("true");
    expect(button.querySelector("circle")).toBeNull();
  });
});
