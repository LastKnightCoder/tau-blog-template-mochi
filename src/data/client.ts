import { createClient, type DataClient, type DataManifest, type DataResult } from "@tau/blog";
import { adaptData, chromeOf } from "./adapt";
import { RouteTable } from "./routes";
import type { Chrome, PageData } from "./types";

/** 站点数据入口：清单只读一次，之后按路由读取页面数据 */
export class SiteData {
  private constructor(
    readonly client: DataClient,
    readonly manifest: DataManifest,
    readonly routes: RouteTable,
    readonly manifestUrl: string,
  ) {}

  static async open(manifestUrl: string, client: DataClient = createClient({ manifestUrl })): Promise<SiteData> {
    const manifest = await client.readManifest();
    return new SiteData(client, manifest, new RouteTable(manifest.items), manifestUrl);
  }

  /** 路由没有对应数据时返回 null，页面显示迷路的团子 */
  async readPage(route: string, signal?: AbortSignal): Promise<PageData | null> {
    const key = this.routes.keyFor(route);
    if (!key) return null;
    return this.readKey(key, signal);
  }

  async readKey(key: string, signal?: AbortSignal): Promise<PageData> {
    return this.adapt(await this.client.readData({ key, signal }));
  }

  adapt(result: DataResult): PageData {
    return adaptData(result, this.manifest, this.routes);
  }

  chrome(): Chrome {
    return chromeOf(this.manifest, this.routes);
  }

  get searchUrl(): string {
    return new URL(this.manifest.search.data, this.manifestUrl).href;
  }

  get faviconUrl(): string | undefined {
    const favicon = this.manifest.site.favicon;
    return favicon && new URL(favicon.href, this.manifestUrl).href;
  }
}
