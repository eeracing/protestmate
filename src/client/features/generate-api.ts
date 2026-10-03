import { FIELD_RULES, type ProtestPayload, type FieldName } from "../../shared/protest-schema";

const REQUEST_TIMEOUT_MS = 30_000;

type ApiBody = { description?: unknown; translation?: unknown; error?: { message?: string; fields?: string[] } } | null;
export type GenerateResult =
  | { ok: true; description: string; translation: string }
  | { ok: false; message: string; fields: FieldName[] };

export async function requestDescription(payload: ProtestPayload): Promise<GenerateResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null) as ApiBody;
    if (!response.ok) {
      const fields = Array.isArray(body?.error?.fields)
        ? body.error.fields.filter((field): field is FieldName => Object.hasOwn(FIELD_RULES, field))
        : [];
      return { ok: false, message: body?.error?.message || "生成失败，请稍后重试。", fields };
    }
    if (typeof body?.description !== "string" || !body.description.trim() ||
      typeof body.translation !== "string" || !body.translation.trim()) {
      return { ok: false, message: "生成结果格式异常，请稍后重试。", fields: [] };
    }
    return { ok: true, description: body.description.trim(), translation: body.translation.trim() };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return { ok: false, message: timedOut ? "生成超时，请稍后重试。" : "网络连接失败，请检查连接后重试。", fields: [] };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
