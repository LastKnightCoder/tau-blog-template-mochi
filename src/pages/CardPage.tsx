import { joinBase } from "@mochi/data/routes";
import type { CardView } from "@mochi/data/types";
import { Chip, toneForTag } from "@mochi/ui";
import { Content } from "@mochi/app/Content";
import { useChrome, usePage, usePageOf } from "@mochi/app/context";
import { longDate, readingMinutes } from "@mochi/app/format";
import { Layout } from "@mochi/app/Layout";

const LINKED_LIMIT = 6;

/** 相关卡片：右栏一列细线隔开的小格，像点心盒旁边附的一张小单子 */
function LinkedCards({ cards }: { cards: CardView["linkedCards"] }) {
  return (
    <aside aria-labelledby="linked-title" className="sticky top-8 self-start max-lg:static">
      <h2 id="linked-title" className="mb-3 text-[15px] font-normal tracking-[0.1em] text-ink-2">
        连着的卡片
      </h2>
      <ul className="m-0 list-none border-0 border-t border-solid border-rule p-0">
        {cards.slice(0, LINKED_LIMIT).map((card) => (
          <li key={card.target.key}>
            <a href={card.href} className="group flex gap-3 border-0 border-b border-solid border-rule py-4 text-ink no-underline">
              <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden className="mt-[7px] shrink-0 text-ink-3 transition-colors group-hover:text-seal">
                <path d="M2 6h8M7 3l3 3-3 3" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="line-clamp-3 text-[14.5px] leading-[1.85] transition-colors group-hover:text-sakura-ink">{card.summary}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** 卡片详情：和文章同一种排版，一张卡片就是一小段正文 */
export function CardPage() {
  const card = usePageOf("card");
  const { result } = usePage();
  const { site } = useChrome();
  const linked = card.linkedCards;

  return (
    <Layout>
      <div className="mx-auto grid max-w-[1120px] grid-cols-[minmax(0,660px)_260px] justify-center gap-16 px-14 pt-12 pb-24 max-lg:grid-cols-[minmax(0,660px)] max-lg:gap-12 max-md:px-6">
        <article className="min-w-0">
          <p className="mb-8 flex flex-wrap items-center gap-x-[18px] gap-y-2 text-[14px] text-ink-2">
            <time dateTime={new Date(card.createTime).toISOString()}>{longDate(card.createTime)}</time>
            <span>约 {readingMinutes(card.content)} 分钟</span>
            {card.tags.map((tag) => (
              <a key={tag} href={`${joinBase(site.basePath, "/cards")}?tag=${encodeURIComponent(tag)}`} className="no-underline hover:[&_span]:text-ink">
                <Chip tone={toneForTag(tag)}>{tag}</Chip>
              </a>
            ))}
          </p>
          <Content result={result} />
          {card.updateTime !== card.createTime && (
            <p className="mt-12 border-0 border-t border-solid border-rule pt-5 text-[13px] text-ink-3">最后更新于 {longDate(card.updateTime)}</p>
          )}
        </article>
        {linked.length > 0 && <LinkedCards cards={linked} />}
      </div>
    </Layout>
  );
}
