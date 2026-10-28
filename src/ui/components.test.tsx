import { describe, expect, it, vi } from "vitest";
import { click, render } from "@mochi/test-utils";
import { Bubble, Button, Candy, Card, Chip, DayNightSwitch, Input, Note, toneForTag } from "./index";

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

  it("变体换底色，调用方 className 可以覆盖默认类", () => {
    const { container } = render(
      <>
        <Button variant="primary">主要</Button>
        <Button variant="accent" className="bg-mint">
          强调
        </Button>
      </>,
    );
    const [primary, accent] = container.querySelectorAll("button");
    expect(primary.className).toContain("bg-butter");
    expect(accent.className).toContain("bg-mint");
    expect(accent.className).not.toContain("bg-accent-ink");
  });

  it("只有图标时是正方形", () => {
    const button = render(<Button icon="🔍" aria-label="搜索" />).container.querySelector("button")!;
    expect(button.className).toContain("size-[42px]");
    expect(button.getAttribute("aria-label")).toBe("搜索");
  });
});

describe("Candy 与 Chip", () => {
  it("糖果用 aria-pressed 表示选中", () => {
    const { container } = render(
      <>
        <Candy selected>全部</Candy>
        <Candy>生活</Candy>
      </>,
    );
    const [on, off] = container.querySelectorAll("button");
    expect(on.getAttribute("aria-pressed")).toBe("true");
    expect(on.className).toContain("bg-pink");
    expect(off.getAttribute("aria-pressed")).toBe("false");
  });

  it("同一个标签永远落到同一种颜色", () => {
    expect(toneForTag("咖啡")).toBe(toneForTag("咖啡"));
    const tones = new Set(["生活", "编程", "读书", "设计", "思考", "咖啡", "Rust", "旅行"].map(toneForTag));
    expect(tones.size).toBeGreaterThan(2);
    expect(render(<Chip tone={toneForTag("咖啡")}>#咖啡</Chip>).container.firstElementChild!.className).toContain(`bg-${toneForTag("咖啡")}`);
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

describe("Bubble、Card 与 Note", () => {
  it("气泡内容变化会被读屏播报", () => {
    expect(render(<Bubble>嗨</Bubble>).container.firstElementChild!.getAttribute("role")).toBe("status");
  });

  it("可交互卡片才有悬停上抬", () => {
    const { container } = render(
      <>
        <Card>静态</Card>
        <Card interactive>可点</Card>
      </>,
    );
    const [still, live] = container.children;
    expect(still.className).not.toContain("hover:shadow-lift-l");
    expect(live.className).toContain("hover:shadow-lift-l");
  });

  it("便签的倾斜角度写在样式变量上，图钉可以去掉", () => {
    const { container } = render(
      <>
        <Note tilt={2}>一</Note>
        <Note pin={false}>二</Note>
      </>,
    );
    const [tilted, plain] = container.children as unknown as HTMLElement[];
    expect(tilted.style.getPropertyValue("--note-tilt")).toBe("2deg");
    expect(tilted.querySelector("[aria-hidden]")).not.toBeNull();
    expect(plain.querySelector("[aria-hidden]")).toBeNull();
  });
});

describe("DayNightSwitch", () => {
  it("是一个开关，点击切换到另一个模式", () => {
    const change = vi.fn();
    const { container, rerender } = render(<DayNightSwitch mode="light" onChange={change} />);
    const button = container.querySelector("button")!;
    expect(button.getAttribute("role")).toBe("switch");
    expect(button.getAttribute("aria-checked")).toBe("false");
    click(button);
    expect(change).toHaveBeenCalledWith("dark");
    rerender(<DayNightSwitch mode="dark" onChange={change} />);
    expect(button.getAttribute("aria-checked")).toBe("true");
  });
});
