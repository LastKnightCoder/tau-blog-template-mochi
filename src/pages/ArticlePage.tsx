import { useEffect, useMemo, useRef, useState } from "react";
import type { OutlineHeading } from "@tau/blog";
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

/** 文章是一张活页手帐纸：左侧打孔、顶部两条和纸胶带，正文本身保持清爽 */
export function ArticlePage() {
  const article = usePageOf("article");
  const { result, key } = usePage();
  const { site } = useChrome();
  const sheet = useRef<HTMLElement>(null);
  const [headings, setHeadings] = useState<OutlineHeading[]>([]);
  const reading = useReading(sheet, headings.length);
  const minutes = useMemo(() => readingMinutes(article.content), [article.content]);
  const [burp, setBurp] = useState(false);

  // 读完一篇，团子打个嗝说谢谢
  useEffect(() => {
    if (!reading.finished || headings.length === 0) return;
    setBurp(true);
    const timer = setTimeout(() => setBurp(false), BURP_MS);
    return () => clearTimeout(timer);
  }, [reading.finished, headings.length]);

  return (
    <Layout>
      <div className="mx-auto grid max-w-[1040px] grid-cols-[1fr_210px] gap-[34px] px-10 pt-[34px] pb-20 max-xl:grid-cols-1 max-sm:px-3">
        <article ref={sheet} className="mochi-sheet relative rounded-[6px_22px_22px_6px] border-sheet bg-paper pt-11 pr-[54px] pb-[50px] pl-[70px] shadow-sheet max-sm:px-6 max-sm:pl-10">
          <span aria-hidden className="mochi-washi absolute -top-3.5 left-[60px] h-[30px] w-[120px] -rotate-[4deg]" />
          <span aria-hidden className="mochi-washi mochi-washi-mint absolute -top-3.5 right-[50px] h-[30px] w-[120px] rotate-[5deg]" />
          {article.bannerBg && <img src={article.bannerBg} alt="" className="mb-6 max-h-[360px] w-full rounded-md border-sheet object-cover" />}
          <p className="flex flex-wrap items-center gap-2.5 text-[13px] text-ink-2">
            {article.author && <span>{article.author}</span>}
            <time dateTime={new Date(article.createTime).toISOString()}>{longDate(article.createTime)}</time>
            <span>约 {minutes} 分钟</span>
          </p>
          <h1 className="mt-3.5 mb-[22px] font-head text-[40px] leading-[1.3] max-sm:text-[30px]">{article.title}</h1>
          <Content result={result} onOutline={setHeadings} />
          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <a key={tag} href={`${joinBase(site.basePath, "/articles")}?tag=${encodeURIComponent(tag)}`} className="no-underline">
                  <Chip tone={toneForTag(tag)}>#{tag}</Chip>
                </a>
              ))}
            </div>
          )}
          <Reactions contentKey={key} />
          {article.updateTime !== article.createTime && <p className="mt-2.5 text-center text-[12px] text-ink-2">最后更新于 {longDate(article.updateTime)}</p>}
        </article>
        {headings.length > 0 && (
          <div className="relative">
            {burp && <Bubble className="absolute -top-12 left-0 z-10 whitespace-nowrap">嗝～谢谢投喂！</Bubble>}
            <Outline
              headings={headings}
              active={reading.active}
              progress={reading.progress}
              finished={reading.finished}
              color={site.mascotColor}
              onSelect={(index) => scrollToHeading(sheet.current, index)}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
