# ProtestMate

ProtestMate 帮助中文 iRacing 玩家把赛道事故中的事实、判断与感受整理成可直接提交的英文申诉描述，并提供中文翻译供核对。

## 技术与结构

- Astro 静态页面、TypeScript、原生浏览器交互；无 React/Vue
- Cloudflare Workers Static Assets 提供构建后的页面，Worker 处理 `/api/generate`
- 可配置的 Chat Completions 服务（当前使用 Google AI Studio）与 Cloudflare Rate Limiting

```text
src/pages/                 Astro 路由
src/components/            页面、表单、结果与弹窗的 HTML
src/styles/                页面样式
src/client/                浏览器交互、表单请求、邮件状态判定
src/shared/                枚举选项与共享 payload 校验
src/worker/api/            HTTP 协议与生成接口
src/worker/ai/             prompt、服务配置与多服务回落
public/assets/            指南图片与透明 WebP 品牌图标
```

页面样式和文案在 Astro 组件及 `src/styles/app.css`；表单选项在 `src/shared/protest-options.ts`，字段校验在 `src/shared/protest-schema.ts`。浏览器和 Worker 使用同一校验函数。AI prompt 在 `src/worker/ai/prompt.ts`，服务顺序在 `src/worker/ai/providers.ts`，远程请求与回落在 `src/worker/ai/provider.ts`。

品牌图标均为 1:1 的透明 WebP。`public/favicon.webp` 用于浏览器标签页；`public/assets/brand/icon-192.webp` 用于页眉，并与 512px 版本用于 `public/site.webmanifest`。

项目不使用数据库或登录系统，也不会主动保存用户提交的事故内容。邮件状态判定仅在浏览器中进行。

## 本地开发

```bash
npm ci
npm run dev
```

`dev` 先构建 Astro，再用 Wrangler 在本地启动完整站点和 API，通常位于 <http://localhost:8787>。修改页面或客户端代码后重启 `dev` 以重新构建。只修改 UI 时可用 `npm run dev:ui` 启动 Astro 的热更新服务；该服务不运行 Worker API。

本地调用 AI 仍访问配置的远程服务，并可能产生用量或费用。将 API Key 写入不提交 Git 的 `.dev.vars` 文件。Rate Limiting namespace `80731427` 专用于 ProtestMate；同一 Cloudflare 账户下的其他 Worker 不应复用。

## AI 服务配置与回落

编辑 `src/worker/ai/providers.ts` 中的 `AI_PROVIDERS` 数组，按调用优先级添加条目。每项需要唯一的 Secret 名称、完整的 HTTPS Chat Completions URL 和模型名。配置文件中只写 Secret **名称**，密钥值放在 Cloudflare Dashboard 的 Worker **Settings > Variables and Secrets**，本地则放在 `.dev.vars`。每个账号各写一项；数组顺序就是回落顺序。Secret 的值是原始 API Key，不是 JSON。

当前启用 Google AI Studio 的 Gemma 4 26B，使用 `GEMINI_API_KEY` Secret。Cloudflare Workers AI 回落配置已暂时注释；恢复时需要取消注释，将 `REPLACE_WITH_ACCOUNT_ID` 替换为实际 Account ID，并添加 `CLOUDFLARE_AI_API_KEY` Secret。Google 条目使用 Chat Completions 兼容接口，通过 `extra_body` 将思考级别设为 `minimal`。未配置某项 Secret 时会跳过该项并继续尝试下一项。

例如，可在现有条目后添加 DeepSeek：

```ts
{
  name: "deepseek",
  url: "https://api.deepseek.com/chat/completions",
  model: "填写该服务当前支持的模型名",
  secretName: "DEEPSEEK_API_KEY",
},
```

所有条目使用 Chat Completions 协议。OpenRouter 使用 `https://openrouter.ai/api/v1/chat/completions`。OpenCode 须选用其支持 Chat Completions 的模型及对应端点。供应商特有的请求字段可放入 `extraBody`，单项超时可用 `timeoutMs` 设置。

例如本地 `.dev.vars`：

```text
CLOUDFLARE_AI_API_KEY=实际的 Workers AI API Token
DEEPSEEK_API_KEY=实际的 DeepSeek API Key
GEMINI_API_KEY=Google AI Studio 创建的 Gemini API Key
```

每项默认最多等待 8 秒，单次生成总计最多等待 25 秒。超时、网络错误、HTTP 错误或无效输出均会切换下一项。Workers AI API Token 需要 Workers AI Read 和 Workers AI Edit 权限。前端接口、输入校验和 IP 限流保持不变。

## 检查与部署

```bash
npm run check
npm run deploy
```

`check` 依次运行 TypeScript 检查、Astro 构建和 Wrangler 部署 dry-run。`deploy` 会重新构建并实际部署；Wrangler 从 `dist/` 上传静态资源，`/api/*` 优先交给 Worker。

ProtestMate 只生成英文描述，不会代替用户提交申诉或上传 replay。请遵循 [iRacing 官方申诉指南](https://support.iracing.com/support/solutions/articles/31000133441-how-to-file-a-protest)。本项目与 iRacing.com Motorsport Simulations, LLC 无隶属关系。
