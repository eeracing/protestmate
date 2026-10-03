export type ProviderConfig = {
  name: string;
  url: string;
  model: string;
  secretName: string;
  timeoutMs?: number;
  extraBody?: Record<string, unknown>;
};

// Tried in order. Only secret names, never API keys, belong in this file.
export const AI_PROVIDERS: ProviderConfig[] = [
  {
    name: "google-ai-studio-gemma",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemma-4-26b-a4b-it",
    secretName: "GEMINI_API_KEY",
    timeoutMs: 12_000,
    extraBody: { extra_body: { google: { thinking_config: { thinking_level: "minimal", include_thoughts: false } } } },
  },
  // Cloudflare Workers AI 回落暂时停用；配置完成后取消注释即可恢复。
  // {
  //   name: "cloudflare",
  //   url: "https://api.cloudflare.com/client/v4/accounts/REPLACE_WITH_ACCOUNT_ID/ai/v1/chat/completions",
  //   model: "@cf/google/gemma-4-26b-a4b-it",
  //   secretName: "CLOUDFLARE_AI_API_KEY",
  //   extraBody: { chat_template_kwargs: { enable_thinking: false } },
  // },
];
