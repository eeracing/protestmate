import { validateProtestPayload } from "../../shared/protest-schema";
import { generateDescription } from "../ai/generate";
import { errorResponse, jsonResponse, readPayload } from "./http";
import type { Env } from "../env";

export async function handleGenerate(request: Request, env: Env) {
  if (request.method !== "POST") {
    return errorResponse(405, "METHOD_NOT_ALLOWED", "此接口只接受 POST 请求。", undefined, { allow: "POST" });
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return errorResponse(415, "UNSUPPORTED_MEDIA_TYPE", "请使用 JSON 格式提交。");
  }

  const parsed = await readPayload(request);
  if (parsed.error) return parsed.error;

  const validation = validateProtestPayload(parsed.payload);
  if (validation.fields.length) {
    return errorResponse(422, "INVALID_INPUT", "请检查并补充标记的事故信息。", validation.fields);
  }

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateLimit = await env.AI_RATE_LIMITER.limit({ key: `${clientIp}:generate` });
  if (!rateLimit.success) {
    return errorResponse(429, "RATE_LIMITED", "生成次数过多，请一分钟后再试。", undefined, { "retry-after": "60" });
  }

  let result;
  try {
    result = await generateDescription(validation.value, env);
  } catch {
    return errorResponse(502, "AI_UPSTREAM_ERROR", "生成服务暂时不可用，请稍后重试。");
  }
  if (!result) {
    return errorResponse(502, "AI_OUTPUT_INVALID", "生成结果格式异常，请稍后重试。");
  }
  return jsonResponse(result);
}
