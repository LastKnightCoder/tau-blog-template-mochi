import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: { "@mochi": resolve(__dirname, "src") },
  },
  build: {
    outDir: "dist/site",
    emptyOutDir: true,
    // 宿主按单个样式文件加载，正文插件样式在其后注入
    cssCodeSplit: false,
    rollupOptions: {
      input: { showcase: resolve(__dirname, "showcase.html") },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
