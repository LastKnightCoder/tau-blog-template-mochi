import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "./cn";

const SHEET = "border-hair bg-paper-hi text-ink";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 可点击时悬停换成淡洗色 */
  interactive?: boolean;
}

/** 一张细线框起来的纸：侧栏面板、空态、浮层的底座 */
export function Card({ interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn("rounded-md px-5 py-4", SHEET, interactive && "cursor-pointer transition-colors duration-200 ease-soft hover:bg-wash", className)}
      {...rest}
    />
  );
}

/** 可点击的整张纸，渲染为链接 */
export function CardLink({ className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn("block rounded-md px-5 py-4 no-underline transition-colors duration-200 ease-soft hover:bg-wash", SHEET, className)} {...rest} />;
}
