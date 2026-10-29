import { describe, expect, it } from "vitest";
import { ancestorsOf, buildTagTree, flattenTags, matchesTag } from "./tags";

describe("标签树", () => {
  it("按路径建树，同一项在父节点只计一次，同级按数量排", () => {
    const tree = buildTagTree([{ tags: ["思考/学习", "思考/写作"] }, { tags: ["思考/学习"] }, { tags: ["编程"] }, { tags: ["编程", "生活"] }, { tags: ["思考"] }]);
    expect(tree.map((node) => [node.path, node.count])).toEqual([
      ["思考", 3],
      ["编程", 2],
      ["生活", 1],
    ]);
    expect(tree[0].children.map((node) => [node.path, node.count])).toEqual([
      ["思考/学习", 2],
      ["思考/写作", 1],
    ]);
    expect(flattenTags(tree).map((node) => node.path)).toEqual(["思考", "思考/学习", "思考/写作", "编程", "生活"]);
  });

  it("父标签命中子标签内容；上级路径用于展开", () => {
    expect(matchesTag(["思考/学习"], "思考")).toBe(true);
    expect(matchesTag(["思考者"], "思考")).toBe(false);
    expect(matchesTag(["任意"], "")).toBe(true);
    expect(ancestorsOf("a/b/c")).toEqual(["a", "a/b"]);
  });
});
