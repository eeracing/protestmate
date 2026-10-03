const MAX_BODY_BYTES = 16 * 1024;
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

export function errorResponse(status: number, code: string, message: string, fields?: string[], headers: Record<string, string> = {}) {
  const error: { code: string; message: string; fields?: string[] } = { code, message };
  if (fields?.length) error.fields = fields;
  return jsonResponse({ error }, status, headers);
}

export async function readPayload(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { error: errorResponse(413, "PAYLOAD_TOO_LARGE", "提交内容过长，请精简后重试。") };
  }

  let rawBody;
  try {
    rawBody = await request.arrayBuffer();
  } catch {
    return { error: errorResponse(400, "INVALID_JSON", "无法读取提交内容。") };
  }
  if (rawBody.byteLength > MAX_BODY_BYTES) {
    return { error: errorResponse(413, "PAYLOAD_TOO_LARGE", "提交内容过长，请精简后重试。") };
  }

  try {
    return { payload: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(rawBody)) };
  } catch {
    return { error: errorResponse(400, "INVALID_JSON", "JSON 格式无效，请检查后重试。") };
  }
}

