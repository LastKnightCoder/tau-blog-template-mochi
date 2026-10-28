import { useEffect, useState } from "react";

const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;

/** 一段时间没有鼠标、键盘或滚动就算空闲，团子会睡着；任何操作立刻叫醒 */
export function useIdle(timeoutMs: number): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer = setTimeout(() => setIdle(true), timeoutMs);
    const wake = () => {
      clearTimeout(timer);
      setIdle(false);
      timer = setTimeout(() => setIdle(true), timeoutMs);
    };
    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, wake, { passive: true });
    return () => {
      clearTimeout(timer);
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, wake);
    };
  }, [timeoutMs]);
  return idle;
}
