import { useEffect, useMemo, useRef, useState } from "react";
import type { OutlineHeading } from "@tau/blog";
import { Mochi } from "@mochi/mochi";
import { joinBase } from "@mochi/data/routes";
import { Bubble, Chip, toneForTag } from "@mochi/ui";
import { Content } from "@mochi/app/Content";
import { useChrome, usePage, usePageOf } from "@mochi/app/context";
import { longDate, readingMinutes } from "@mochi/app/format";
import { Layout } from "@mochi/app/Layout";
import { Outline } from "./Outline";
import { Reactions } from "./Reactions";
import { scrollToHeading, useReading } from "./reading";

const BURP_MS = 2400;

/** 文章页：宽页边，左边目录，右边页边上一只打盹的团子，读完会醒 */
export function ArticlePage() {
  const article = usePageOf("article");
  const { result, key } = usePage();
  const { site } = useChrome();
  const body = useRef<HTMLElement>(null);
  const [headings, setHeadings] = useState<OutlineHeading[]>([]);
  const reading = useReading(body, headings.length);
  const minutes = useMemo(() => readingMinutes(article.content), [article.content]);
  const [thanks, setThanks] = useState(false);

  // 读完一篇，页边的团子醒过来说谢谢
  useEffect(() => {
    if (!reading.finished) return;
    setThanks(true);
    const timer = setTimeout(() => setThanks(false), BURP_MS);
    return () => clearTimeout(timer);
  }, [reading.finished]);

  return (
    <Layout>
      <div className="mx-auto grid max-w-[1120px] grid-cols-[150px_minmax(0,660px)_1fr] gap-12 px-14 pt-8 pb-24 max-xl:grid-cols-[minmax(0,680px)] max-xl:justify-center max-md:px-6">
        {headings.length > 0 ? (
          <Outline
            headings={headings}
            active={reading.active}
            progress={reading.progress}
            finished={reading.finished}
            color={site.mascotColor}
            onSelect={(index) => scrollToHeading(body.current, index)}
          />
        ) : (
          <span className="max-xl:hidden" />
        )}
        <article ref={body} className="min-w-0">
          {article.bannerBg && <img src={article.bannerBg} alt="" className="mb-9 max-h-[360px] w-full rounded-sm object-cover" />}
          <h1 className="text-[40px] leading-[1.35] font-normal tracking-[0.04em] max-sm:text-[30px]">{article.title}</h1>
          <p className="mt-4 mb-10 flex flex-wrap gap-x-[18px] gap-y-1 text-[14px] text-ink-2">
            {article.author && <span>{article.author}</span>}
            <time dateTime={new Date(article.createTime).toISOString()}>{longDate(article.createTime)}</time>
            <span>约 {minutes} 分钟</span>
          </p>
          <Content result={result} onOutline={setHeadings} />
          <footer className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-4 border-0 border-t border-solid border-rule pt-7">
            <Reactions contentKey={key} />
            {article.tags.length > 0 && (
              <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
                {article.tags.map((tag) => (
                  <li key={tag}>
                    <a href={`${joinBase(site.basePath, "/articles")}?tag=${encodeURIComponent(tag)}`} className="no-underline hover:[&_span]:text-ink">
                      <Chip tone={toneForTag(tag)}>{tag}</Chip>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {article.updateTime !== article.createTime && <p className="ml-auto text-[13px] text-ink-3">最后更新于 {longDate(article.updateTime)}</p>}
          </footer>
        </article>
        <aside aria-hidden className="sticky top-8 self-start pt-20 max-xl:hidden">
          <div className="relative w-[84px]">
            {thanks && <Bubble className="absolute -top-11 left-0 whitespace-nowrap">谢谢投喂～</Bubble>}
            <Mochi size={84} mood={reading.finished ? "shy" : "sleepy"} color={site.mascotColor} blink={false} />
          </div>
          <p className="mt-2 max-w-[140px] text-[13px] text-ink-3">{reading.finished ? `${site.mascotName}醒了。` : `${site.mascotName}在页边打盹，读完会醒。`}</p>
        </aside>
      </div>
    </Layout>
  );
}
