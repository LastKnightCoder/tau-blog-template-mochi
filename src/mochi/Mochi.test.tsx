import { createRef } from "react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { click, render } from "@mochi/test-utils";
import { Mochi, type MochiHandle } from "./Mochi";
import { pupilOffset } from "./motion";
import { MOODS, type MochiMood } from "./types";

const ALL_MOODS = Object.keys(MOODS) as MochiMood[];

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Mochi 表情", () => {
  it("6 个表情的五官各不相同，身体轮廓相同", () => {
    const faces = ALL_MOODS.map((mood) => {
      const { container } = render(<Mochi mood={mood} blink={false} />);
      const body = container.querySelector(".mochi-body > path")!.getAttribute("d");
      const face = [...container.querySelectorAll(".mochi-body > :not(path:first-child)")].map((node) => node.outerHTML).join("");
      return { body, face };
    });
    expect(new Set(faces.map((item) => item.body)).size).toBe(1);
    expect(new Set(faces.map((item) => item.face)).size).toBe(ALL_MOODS.length);
  });

  it("颜色只换身体填充，五官不变", () => {
    const pink = render(<Mochi color="sakura" blink={false} />).container;
    const mint = render(<Mochi color="matcha" blink={false} />).container;
    expect(pink.querySelector(".mochi-body > path")!.getAttribute("fill")).toBe("var(--mochi-body-sakura)");
    expect(mint.querySelector(".mochi-body > path")!.getAttribute("fill")).toBe("var(--mochi-body-matcha)");
    expect(pink.querySelectorAll(".mochi-eye").length).toBe(mint.querySelectorAll(".mochi-eye").length);
  });

  it("小于 32px 用简化版：去掉腮红和道具", () => {
    const small = render(<Mochi mood="sleepy" size={24} blink={false} />).container;
    const large = render(<Mochi mood="sleepy" size={120} blink={false} />).container;
    expect(small.querySelector(".mochi-zz")).toBeNull();
    expect(small.querySelectorAll("ellipse[opacity]").length).toBe(0);
    expect(large.querySelector(".mochi-zz")).not.toBeNull();
  });

  it("细墨线随尺寸换算，小尺寸加粗，夹在 1.8–5.5 之间", () => {
    const width = (size: number) =>
      Number(render(<Mochi size={size} blink={false} />).container.querySelector(".mochi-body > path")!.getAttribute("stroke-width"));
    expect(width(24)).toBe(5.5);
    expect(width(120)).toBe(1.8);
    expect(width(200)).toBe(1.8);
    expect(width(64)).toBeCloseTo(3, 1);
  });

  it("默认头顶一片抹茶叶，戴帽子时收起叶子", () => {
    const leaf = render(<Mochi blink={false} />).container;
    const hat = render(<Mochi hat="night" blink={false} />).container;
    expect(leaf.querySelector('.mochi-body path[fill="var(--mochi-leaf)"]')).not.toBeNull();
    expect(hat.querySelector('.mochi-body path[fill="var(--mochi-leaf)"]')).toBeNull();
    expect(hat.querySelector('.mochi-body path[fill="var(--mochi-azuki)"]')).not.toBeNull();
  });
});

describe("Mochi 无障碍", () => {
  it("不传 label 时是装饰，对读屏隐藏", () => {
    const svg = render(<Mochi blink={false} />).container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.querySelector("title")).toBeNull();
  });

  it("传 label 时是带标题的图片", () => {
    const svg = render(<Mochi label="团子在打瞌睡" blink={false} />).container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBe("img");
    expect(document.getElementById(svg.getAttribute("aria-labelledby")!)!.textContent).toBe("团子在打瞌睡");
  });

  it("可以戳时是按钮，名称包含当前表情", () => {
    const button = render(<Mochi mood="shy" onPoke={() => {}} blink={false} />).container.querySelector("button")!;
    expect(button.getAttribute("aria-label")).toBe("团子 · 害羞");
    expect(button.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Mochi 动作", () => {
  it("戳一下播放当前表情的招牌动作并回调", () => {
    const poke = vi.fn();
    const { container } = render(<Mochi mood="dizzy" onPoke={poke} blink={false} />);
    click(container.querySelector("button")!);
    expect(poke).toHaveBeenCalledOnce();
    expect(container.querySelector("svg")!.dataset.act).toBe("wobble");
  });

  it("play() 可指定动作，动画结束后清除", () => {
    vi.useFakeTimers();
    const ref = createRef<MochiHandle>();
    const { container } = render(<Mochi ref={ref} blink={false} />);
    const svg = container.querySelector("svg")!;
    act(() => ref.current!.play("hop"));
    expect(svg.dataset.act).toBe("hop");
    act(() => {
      svg.dispatchEvent(new Event("animationend"));
    });
    expect(svg.dataset.act).toBeUndefined();
    act(() => ref.current!.play());
    act(() => vi.advanceTimersByTime(2000));
    expect(svg.dataset.act).toBeUndefined();
  });
});

describe("眼睛跟随与眨眼", () => {
  it("瞳孔偏移方向跟随指针，300px 外到达上限", () => {
    expect(pupilOffset(0, 0)).toEqual({ x: 0, y: 0 });
    expect(pupilOffset(600, 0)).toEqual({ x: 3.5, y: 0 });
    const near = pupilOffset(0, 150);
    expect(near.x).toBeCloseTo(0);
    expect(near.y).toBeCloseTo(1.5);
  });

  it("track 时指针移动会转动眼睛，卸载后停止监听", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    const removed = vi.spyOn(window, "removeEventListener");
    const { container, rerender } = render(<Mochi track blink={false} />);
    const svg = container.querySelector("svg")!;
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 120, height: 100, right: 120, bottom: 100, x: 0, y: 0, toJSON() {} });
    // jsdom 没有 PointerEvent，坐标字段相同的 MouseEvent 足以驱动监听
    window.dispatchEvent(new MouseEvent("pointermove", { clientX: 1000, clientY: 50 }));
    frames.shift()!(0);
    expect((svg.querySelector(".mochi-eye") as SVGGElement).style.transform).toBe("translate(3.5px, 0px)");
    rerender(<Mochi track={false} blink={false} />);
    expect(removed).toHaveBeenCalledWith("pointermove", expect.any(Function));
  });

  it("减弱动态效果时不跟随、不眨眼", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const added = vi.spyOn(window, "addEventListener");
    const svg = render(<Mochi track />).container.querySelector("svg")!;
    expect(added).not.toHaveBeenCalledWith("pointermove", expect.any(Function), expect.anything());
    vi.spyOn(Math, "random").mockReturnValue(0);
    act(() => vi.advanceTimersByTime(5000));
    expect(svg.dataset.blink).toBeUndefined();
  });

  it("眨眼由共享定时器驱动", () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const svg = render(<Mochi />).container.querySelector("svg")!;
    act(() => vi.advanceTimersByTime(2400));
    expect(svg.dataset.blink).toBe("");
    act(() => vi.advanceTimersByTime(200));
    expect(svg.dataset.blink).toBeUndefined();
  });
});
