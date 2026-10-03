import { handleGenerate } from "./api/generate";
import { errorResponse } from "./api/http";
import type { Env } from "./env";

export default {
  async fetch(request: Request, env: Env) {
    try {
      const { pathname } = new URL(request.url);
      if (pathname === "/api/generate") return await handleGenerate(request, env);
      return errorResponse(404, "NOT_FOUND", "接口不存在。");
    } catch {
      return errorResponse(500, "INTERNAL_ERROR", "服务暂时不可用，请稍后重试。");
    }
  },
};
