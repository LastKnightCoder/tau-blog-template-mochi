import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";

// 测试不经 Tailwind 插件：行为测试只看 DOM 与类名，样式契约由 tokens 测试单独解析 CSS
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@mochi": resolve(__dirname, "src") } },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
