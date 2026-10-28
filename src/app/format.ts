const pad = (value: number) => String(value).padStart(2, "0");

/** 2026 年 10 月 21 日 */
export function longDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

/** 10·21，用于邮戳与列表 */
export function shortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${pad(date.getMonth() + 1)}·${pad(date.getDate())}`;
}

export function dateParts(timestamp: number) {
  const date = new Date(timestamp);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

const FRESH_DAYS = 7;

/** 7 天内发布的算新内容：首页房顶的角标和邮箱小旗都看它 */
export function isFresh(timestamp: number, now = Date.now()): boolean {
  return now - timestamp < FRESH_DAYS * 86_400_000;
}

interface TextNode {
  text?: unknown;
  children?: unknown;
}

function plainText(nodes: readonly unknown[]): string {
  return nodes
    .map((node) => {
      if (!node || typeof node !== "object") return "";
      const { text, children } = node as TextNode;
      if (typeof text === "string") return text;
      return Array.isArray(children) ? plainText(children) : "";
    })
    .join("");
}

/** 中文按每分钟 300 字、英文按每分钟 200 词估算，至少 1 分钟 */
export function readingMinutes(nodes: readonly unknown[]): number {
  const text = plainText(nodes);
  const han = text.match(/[一-龥]/g)?.length ?? 0;
  const words = text.match(/[a-zA-Z]+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(han / 300 + words / 200));
}

export function truncate(value: string, length: number): string {
  return value.length <= length ? value : `${value.slice(0, length)}…`;
}
