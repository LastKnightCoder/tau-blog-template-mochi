import { Component, useCallback, type ReactNode } from "react";
import { ContentRenderer, type ContentRef, type DataResult, type LinkRenderProps, type OutlineHeading } from "@tau/blog";
import { joinBase } from "@mochi/data/routes";
import { Mochi } from "@mochi/mochi";
import { useSite } from "./context";

class ContentBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex items-center gap-3 rounded-md border-sheet bg-soft-peach px-4 py-3 text-[15px]">
        <Mochi mood="dizzy" size={48} />
        正文没能打开：{this.state.error.message}
      </div>
    );
  }
}

/** 未发布的站内链接只显示文字，不给访客一个点了没反应的链接 */
function renderLink({ href, title, children }: LinkRenderProps) {
  if (!href) {
    return (
      <span className="mochi-link-missing" title="这篇还没有发布">
        {children}
      </span>
    );
  }
  return (
    <a href={href} title={title || undefined} className="mochi-link">
      {children}
    </a>
  );
}

export function Content({ result, onOutline }: { result: DataResult; onOutline?: (headings: OutlineHeading[]) => void }) {
  const { site } = useSite();
  const basePath = site.manifest.site.basePath;
  const hrefFor = useCallback(
    (target: ContentRef) => {
      const route = site.routes.routeFor(target);
      return route === undefined ? undefined : joinBase(basePath, route);
    },
    [site, basePath],
  );
  return (
    <ContentBoundary key={result.dataUrl}>
      <ContentRenderer
        content={result}
        hrefFor={hrefFor}
        renderLink={renderLink}
        onOutline={onOutline}
        className="mochi-prose"
        fallback={
          <p role="status" className="flex items-center gap-2 text-[15px] text-ink-2">
            <Mochi mood="curious" size={36} />
            正在摊开纸……
          </p>
        }
      />
    </ContentBoundary>
  );
}
