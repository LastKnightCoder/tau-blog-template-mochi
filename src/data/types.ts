import type * as Published from "@tau/blog";

/**
 * 页面消费的数据：在发布协议之上把每个 ContentRef 换成本模板的站内路由（href）。
 * 路由规则只属于本模板，宿主不知道这些地址。
 */
export type Linked<T> = T & { href: string };

export interface SiteSettings {
  title: string;
  basePath: string;
  description: string;
  mascotName: string;
  mascotColor: "sakura" | "matcha" | "shiro" | "kuri";
  /** 戳团子时轮流说的话 */
  mascotLines: string[];
  /** 云、烟、蜗牛等常驻动画 */
  ambient: boolean;
}

export interface SidebarNode {
  title: string;
  href?: string;
  children?: SidebarNode[];
}

export interface DocCollectionView {
  label: string;
  items: Array<{ id: number; title: string; href: string; active: boolean }>;
}

export interface TagNode {
  tag: string;
  /** 从根到当前节点的完整标签，如「思考/学习」 */
  path: string;
  count: number;
  children: TagNode[];
}

export type HomeView = Omit<Published.HomeData, "timeline"> & { timeline: Array<Linked<Published.TimelineItem>> };
export type ListView = Omit<Published.ListData, "items"> & { items: Array<Linked<Published.ListItem>> };
export type CardView = Omit<Published.CardData, "linkedCards"> & { linkedCards: Array<Linked<Published.RelatedCard>> };
export type ArticleView = Published.ArticleData;
export type DocView = Omit<Published.DocData, "breadcrumb" | "prevPage" | "nextPage"> & {
  breadcrumb: Array<{ label: string; href?: string }>;
  prevPage?: { title: string; href: string };
  nextPage?: { title: string; href: string };
  currentPath: string;
};

export interface PageViews {
  home: HomeView;
  list: ListView;
  card: CardView;
  article: ArticleView;
  doc: DocView;
}

export type PageContent = { [K in keyof PageViews]: { type: K; content: PageViews[K] } }[keyof PageViews];

export interface NavItem {
  label: string;
  href: string;
  kind: "articles" | "cards" | "projects";
}

/** 每页都有的外壳数据 */
export interface Chrome {
  site: SiteSettings;
  navigation: NavItem[];
  collections: DocCollectionView[];
}

export interface PageData extends Chrome {
  key: string;
  page: PageContent;
  /** 原始结果，交给 ContentRenderer 渲染正文 */
  result: Published.DataResult;
  sidebar?: SidebarNode[];
}
