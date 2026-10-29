import type { TagNode } from "./types";

/** 选中父标签时子标签下的内容也算命中 */
export function matchesTag(tags: readonly string[], active: string): boolean {
  return !active || tags.some((tag) => tag === active || tag.startsWith(`${active}/`));
}

interface Draft {
  tag: string;
  path: string;
  count: number;
  children: Map<string, Draft>;
}

/** 从列表项的标签（「思考/学习」式路径）建一棵树；一项内容在同一节点只计一次，同级按数量多到少排 */
export function buildTagTree(items: ReadonlyArray<{ tags: readonly string[] }>): TagNode[] {
  const root = new Map<string, Draft>();
  for (const item of items) {
    const counted = new Set<string>();
    for (const raw of item.tags) {
      let level = root;
      let path = "";
      for (const tag of raw.split("/").map((part) => part.trim()).filter(Boolean)) {
        path = path ? `${path}/${tag}` : tag;
        let node = level.get(tag);
        if (!node) level.set(tag, (node = { tag, path, count: 0, children: new Map() }));
        if (!counted.has(path)) {
          counted.add(path);
          node.count += 1;
        }
        level = node.children;
      }
    }
  }
  const finish = (level: Map<string, Draft>): TagNode[] =>
    [...level.values()]
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-CN"))
      .map(({ tag, path, count, children }) => ({ tag, path, count, children: finish(children) }));
  return finish(root);
}

export function flattenTags(nodes: readonly TagNode[]): TagNode[] {
  return nodes.flatMap((node) => [node, ...flattenTags(node.children)]);
}

/** 当前标签的所有上级路径，用来展开树 */
export function ancestorsOf(path: string): string[] {
  const parts = path.split("/");
  return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join("/"));
}
