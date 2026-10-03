export interface Env {
  AI_RATE_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
  [key: string]: unknown;
}
