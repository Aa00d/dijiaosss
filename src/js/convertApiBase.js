/**
 * 转档 Word/XML 服务根地址（固定 47.108.144.113:9111/api）。
 * 与业务查询接口（VITE_API_BASE_URL）分离。
 * 可通过环境变量 VITE_CONVERT_API_BASE_URL 覆盖（例如本地调试）。
 */
export const CONVERT_API_BASE_URL =
  import.meta.env.VITE_CONVERT_API_BASE_URL || "http://47.108.144.113:9111/api";
