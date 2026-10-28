import { createRoot } from "react-dom/client";
import { App } from "@mochi/app/App";
import { configureBase } from "@mochi/app/navigation";
import { LoadingTown, LostTown } from "@mochi/app/status";
import { applyMode, currentMode } from "@mochi/app/theme";
import { SiteData } from "@mochi/data/client";
import "@mochi/styles/global.css";

const PLACEHOLDER = "__TAU_";

async function start(root: ReturnType<typeof createRoot>) {
  const manifest = document.querySelector<HTMLMetaElement>('meta[name="tau-manifest"]')?.content;
  if (!manifest || manifest.includes(PLACEHOLDER)) throw new Error("请通过 Tau 发布的站点访问这个博客");
  const site = await SiteData.open(new URL(manifest, window.location.origin).href);
  configureBase(site.manifest.site.basePath);
  const favicon = site.manifest.site.favicon;
  if (favicon && site.faviconUrl) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = favicon.mimeType;
    link.href = site.faviconUrl;
    document.head.append(link);
  }
  root.render(<App site={site} />);
}

applyMode(currentMode());
const root = createRoot(document.getElementById("root")!);
root.render(<LoadingTown />);
start(root).catch((error: unknown) => {
  root.render(<LostTown name="团子" homeHref="/" reason={error instanceof Error ? error.message : String(error)} />);
});
