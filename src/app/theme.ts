import { useSyncExternalStore } from "react";

export type Mode = "light" | "dark";

const STORAGE_KEY = "mochi:mode";
const CHANGE_EVENT = "mochi-mode-change";

function stored(): Mode | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** 访客选过就按选择；没选过时跟随系统 */
export function currentMode(): Mode {
  const choice = stored();
  if (choice) return choice;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyMode(mode: Mode) {
  document.documentElement.dataset.mode = mode;
}

export function setMode(mode: Mode) {
  applyMode(mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // 隐私模式下写不进去也不影响本次浏览
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useMode(): Mode {
  return useSyncExternalStore(
    (listener) => {
      window.addEventListener(CHANGE_EVENT, listener);
      return () => window.removeEventListener(CHANGE_EVENT, listener);
    },
    currentMode,
    () => "light",
  );
}

/** 按访客本地时间问候 */
export function greeting(hour = new Date().getHours()): string {
  if (hour < 5) return "🌙 夜深了";
  if (hour < 11) return "☀️ 早上好";
  if (hour < 13) return "🍙 中午好";
  if (hour < 18) return "🌤️ 下午好";
  return "🌙 晚上好";
}
