export type MochiMood = "happy" | "wink" | "curious" | "sleepy" | "dizzy" | "shy";
/** 四种口味：樱花、抹茶、白玉、栗子 */
export type MochiColor = "sakura" | "matcha" | "shiro" | "kuri";
export type MochiHat = "none" | "night" | "post" | "grad" | "santa";
export type MochiAct = "boing" | "wink" | "tilt" | "sink" | "wobble" | "hop";

export interface MochiMoodMeta {
  label: string;
  /** 点击或 play() 时的招牌动作 */
  act: MochiAct;
}

export const MOODS: Record<MochiMood, MochiMoodMeta> = {
  happy: { label: "开心", act: "boing" },
  wink: { label: "眨眼", act: "wink" },
  curious: { label: "好奇", act: "tilt" },
  sleepy: { label: "犯困", act: "sink" },
  dizzy: { label: "晕晕", act: "wobble" },
  shy: { label: "害羞", act: "hop" },
};

export const COLORS: Record<MochiColor, string> = {
  sakura: "樱花",
  matcha: "抹茶",
  shiro: "白玉",
  kuri: "栗子",
};

export const HATS: Record<MochiHat, string> = {
  none: "不戴",
  night: "睡帽",
  post: "邮差帽",
  grad: "学士帽",
  santa: "圣诞帽",
};
