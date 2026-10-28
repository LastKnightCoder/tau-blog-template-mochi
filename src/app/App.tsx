import { useCallback, useEffect, useState, type ComponentType } from "react";
import type { SiteData } from "@mochi/data/client";
import type { PageData } from "@mochi/data/types";
import { joinBase } from "@mochi/data/routes";
import { ArticlePage } from "@mochi/pages/ArticlePage";
import { CardPage } from "@mochi/pages/CardPage";
import { DocPage } from "@mochi/pages/DocPage";
import { HomePage } from "@mochi/pages/HomePage";
import { ListPage } from "@mochi/pages/ListPage";
import { PageProvider, SiteProvider } from "./context";
import { Layout } from "./Layout";
import { MochiRainProvider } from "./MochiRain";
import { interceptLinks, useLocation } from "./navigation";
import { SearchDialog } from "./Search";
import { LostTown } from "./status";

const PAGES: Record<PageData["page"]["type"], ComponentType> = {
  home: HomePage,
  list: ListPage,
  article: ArticlePage,
  card: CardPage,
  doc: DocPage,
};

type View = { state: "loading" } | { state: "ready"; page: PageData } | { state: "missing" } | { state: "failed"; reason: string };

function pageTitle(page: PageData) {
  const { page: content, site } = page;
  const title = content.type === "article" || content.type === "doc" ? content.content.title : content.type === "list" ? content.content.title : "";
  return title ? `${title} · ${site.title}` : site.title;
}

function usePage(site: SiteData): View {
  const { route } = useLocation();
  const [view, setView] = useState<View>({ state: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    site
      .readPage(route, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setView(page ? { state: "ready", page } : { state: "missing" });
        document.title = page ? pageTitle(page) : `找不到这一页 · ${site.manifest.site.title}`;
        window.scrollTo(0, 0);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setView({ state: "failed", reason: error instanceof Error ? error.message : String(error) });
      });
    return () => controller.abort();
  }, [route, site]);
  return view;
}

export function App({ site }: { site: SiteData }) {
  const view = usePage(site);
  const [searching, setSearching] = useState(false);
  const openSearch = useCallback(() => setSearching(true), []);

  useEffect(() => {
    document.addEventListener("click", interceptLinks);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearching(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", interceptLinks);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const chrome = site.chrome();
  const home = joinBase(chrome.site.basePath, "/");
  let body;
  if (view.state === "ready") {
    const Page = PAGES[view.page.page.type];
    body = (
      <PageProvider page={view.page}>
        <Page key={view.page.key} />
      </PageProvider>
    );
  } else if (view.state === "loading") {
    body = (
      <Layout>
        <p role="status" className="sr-only">
          正在加载
        </p>
      </Layout>
    );
  } else {
    body = (
      <Layout>
        <LostTown name={chrome.site.mascotName} homeHref={home} reason={view.state === "failed" ? view.reason : undefined} />
      </Layout>
    );
  }

  return (
    <SiteProvider value={{ site, openSearch }}>
      <MochiRainProvider>
        {body}
        <SearchDialog open={searching} onClose={() => setSearching(false)} />
      </MochiRainProvider>
    </SiteProvider>
  );
}
