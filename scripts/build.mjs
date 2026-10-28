/**
 * 构建并打包模板：vite 产物 → 宿主替换的占位符 → manifest（含完整摘要）→ output/<id>-<version>.zip。
 * manifest 的身份与站点字段来自 template.json，版本号来自 package.json。
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "vite";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const site = path.join(dist, "site");
// 与插件中心、桌面端的限制一致（packages/plugins/src/template.ts 的 DISTRIBUTION_LIMITS）
const LIMITS = { zipBytes: 16 * 1024 * 1024, expandedBytes: 32 * 1024 * 1024, entries: 512 };
const ENTRIES = ["index.html", "404.html"];

const { version } = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const { siteFields, ...identity } = JSON.parse(await readFile(path.join(root, "template.json"), "utf8"));

await rm(dist, { recursive: true, force: true });
await build({ root, configFile: path.join(root, "vite.config.ts"), mode: "production" });

// 路径路由下页面可能在任意深度，资源改用部署根的绝对路径；__TAU_BASE__ 由宿主发布时替换
const html = (await readFile(path.join(site, "index.html"), "utf8")).replace(/(\s(?:src|href))="\.\//g, '$1="__TAU_BASE__');
if (!html.includes("__TAU_MANIFEST__")) throw new Error("入口缺少 __TAU_MANIFEST__ 占位");
await writeFile(path.join(site, "index.html"), html);
// 静态托管对不存在的路径返回 404.html：内容与入口相同，由前端按地址渲染深链
await writeFile(path.join(site, "404.html"), html);

// woff2-only 去掉了 @font-face 里的后备格式，vite 仍会输出那些文件；没有任何产物引用的字体不进包
const assets = path.join(site, "assets");
const assetNames = await readdir(assets);
const references = (
  await Promise.all(assetNames.filter((name) => /\.(?:js|css)$/.test(name)).map((name) => readFile(path.join(assets, name), "utf8")))
).join("\n") + html;
const orphans = assetNames.filter((name) => /\.(?:woff|ttf|otf|eot)$/.test(name) && !references.includes(name));
await Promise.all(orphans.map((name) => rm(path.join(assets, name))));

const integrity = {};
let expanded = 0;
async function walk(directory, prefix = "") {
  const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const relative = prefix + entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute, `${relative}/`);
      continue;
    }
    if (/^(?:data|_tau|plugin-assets)(?:\/|$)/.test(relative)) throw new Error(`模板不能占用协议目录：${relative}`);
    const content = await readFile(absolute);
    expanded += content.length;
    integrity[`site/${relative}`] = createHash("sha256").update(content).digest("hex");
  }
}
await walk(site);

const manifest = {
  formatVersion: 1,
  apiVersion: 1,
  platform: "desktop",
  ...identity,
  version,
  template: { protocolVersion: 1, root: "site", entries: ENTRIES, siteFields },
  integrity,
};
await writeFile(path.join(dist, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
for (const name of ["README.md", "CHANGELOG.md", "LICENSE"]) {
  const content = await readFile(path.join(root, name)).catch(() => null);
  if (content) await writeFile(path.join(dist, name), content);
}

const files = Object.keys(integrity).length;
if (files + 4 > LIMITS.entries) throw new Error(`文件数 ${files} 超过插件中心上限 ${LIMITS.entries}`);
if (expanded > LIMITS.expandedBytes) throw new Error(`解压后 ${expanded} 字节超过上限 ${LIMITS.expandedBytes}`);

const zip = new AdmZip();
zip.addLocalFolder(dist, identity.id);
const bytes = zip.toBuffer();
if (bytes.length > LIMITS.zipBytes) throw new Error(`ZIP ${bytes.length} 字节超过上限 ${LIMITS.zipBytes}`);
await mkdir(path.join(root, "output"), { recursive: true });
const archive = path.join(root, "output", `${identity.id}-${version}.zip`);
await writeFile(archive, bytes);
console.log(
  JSON.stringify({ id: identity.id, version, files, droppedFonts: orphans.length, expandedBytes: expanded, zipBytes: bytes.length, archive: path.relative(root, archive) }),
);
