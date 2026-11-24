import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages 项目站点部署在 /<repo>/ 子路径下，构建时用 VITE_BASE 指定。
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
