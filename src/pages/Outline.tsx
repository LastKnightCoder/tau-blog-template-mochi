import type { OutlineHeading } from "@tau/blog";
import { Mochi, type MochiColor } from "@mochi/mochi";
import { cn } from "@mochi/ui";

interface OutlineProps {
  headings: OutlineHeading[];
  active: number;
  progress: number;
  finished: boolean;
  color: MochiColor;
  onSelect: (index: number) => void;
}

/** 读到几成：一成一成地说，比百分比更像在和人说话 */
function progressText(progress: number, finished: boolean) {
  if (finished) return "读完了";
  const tenth = Math.floor(progress * 10);
  return tenth <= 0 ? "刚开始读" : `读到${"一二三四五六七八九"[tenth - 1]}成`;
}

/** 左侧目录：一条竖细线，当前章节换成店印色；下面一只小团子报告读到几成 */
export function Outline({ headings, active, progress, finished, color, onSelect }: OutlineProps) {
  const minLevel = Math.min(...headings.map((heading) => heading.level));
  const percent = Math.round(progress * 100);
  return (
    <nav aria-label="目录" className="sticky top-6 self-start text-[13.5px] max-xl:hidden">
      <ol className="m-0 list-none border-0 border-l border-solid border-rule p-0">
        {headings.map((heading, index) => (
          <li key={`${index}-${heading.title}`}>
            <button
              type="button"
              aria-current={index === active ? "location" : undefined}
              onClick={() => onSelect(index)}
              className={cn(
                "-ml-px block w-full cursor-pointer border-0 border-l border-solid border-transparent bg-transparent py-[5px] pr-1 text-left font-body text-ink-2 transition-colors duration-200 ease-soft hover:text-ink",
                index === active && "border-seal text-ink",
              )}
              style={{ paddingLeft: 14 + (heading.level - minLevel) * 12 }}
            >
              {heading.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex items-center gap-2 text-ink-2">
        <Mochi size={30} mood={finished ? "shy" : "happy"} color={color} blink={false} />
        <span role="progressbar" aria-label="阅读进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={progressText(progress, finished)}>
          {progressText(progress, finished)}
        </span>
      </div>
    </nav>
  );
}
