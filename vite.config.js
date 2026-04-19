import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // 必须先写 /api-convert：若写在 /api 之后，/api 会前缀匹配到 /api-convert，转档请求会错误打到查询后端
      "/api-convert": {
        target: "http://47.108.144.113:9111",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-convert/, "/api"),
      },
      // 查询等业务接口
      "/api": {
        target: "http://106.52.57.109:8082",
        changeOrigin: true,
      },
      "/oss": {
        target: "https://ruidao123.oss-cn-beijing.aliyuncs.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/oss/, ""),
      },
    },
  },
  build: {
    sourcemap: true,
  },
});
