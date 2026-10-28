import { defineConfig, type Plugin, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { woff2Only } from "./scripts/woff2-only.mjs";

/** 开发时用内存站点代替宿主数据；生产构建不包含夹具 */
async function devFixture(): Promise<Plugin> {
  const { demoData } = await import("./scripts/dev-fixture.mjs");
  return {
    name: "mochi-dev-fixture",
    apply: "serve",
    transformIndexHtml: (html) => html.replace("__TAU_MANIFEST__", demoData.manifestUrl),
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const body = demoData.files.get(request.url?.split("?")[0] ?? "");
        if (!body) return next();
        response.setHeader("Content-Type", "application/json");
        response.end(body);
      });
    },
  };
}

export default defineConfig(async ({ command }): Promise<UserConfig> => ({
  base: "./",
  plugins: [react(), tailwindcss(), ...(command === "serve" ? [await devFixture()] : [])],
  resolve: {
    dedupe: ["react", "react-dom", "slate", "slate-dom", "slate-react", "react-dnd", "react-dnd-html5-backend"],
    alias: { "@mochi": resolve(__dirname, "src") },
  },
  css: { postcss: { plugins: [woff2Only()] } },
  // 开发时深链（/articles/1）回落到入口页
  appType: "spa",
  build: {
    outDir: "dist/site",
    emptyOutDir: true,
    // 宿主按单个样式文件加载，正文插件样式在其后注入
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
}));
