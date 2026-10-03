# ProtestMate

面向中文 iRacing 玩家的申诉助手：用中文描述赛道事件，生成英文申诉文案，并附上中文翻译供核对。

## 功能

- **申诉文案生成**：根据事件经过和表单信息整理英文描述。
- **中文翻译**：核对生成内容，确认与实际事件一致。
- **提交指南**：查看申诉步骤与 Replay 准备要求。
- **邮件状态识别**：粘贴 iRacing 邮件，了解申诉处理状态；邮件仅在浏览器内处理。

项目无需登录、不使用数据库，也不会主动保存事故内容。生成文案时，相关内容会发送至配置的 AI 服务。

## 本地运行

需要 Node.js **22.12 或更高版本**及 npm。

```bash
npm ci
```

在项目根目录创建 `.dev.vars`，填写 Google AI Studio 的 API Key：

```dotenv
GEMINI_API_KEY=你的_API_Key
```

启动页面和 API：

```bash
npm run dev
```

打开 [localhost:8787](http://localhost:8787)。修改页面或客户端代码后，需要重启此命令以重新构建。

只调试界面时可用 `npm run dev:ui`，支持热更新，但不运行生成 API。本地生成仍会调用远程 AI 服务，按服务商规则计费或消耗配额。`.dev.vars` 已加入 Git 忽略规则，请勿提交密钥。

## AI 配置

当前使用 **Google AI Studio 的 Gemma 4 26B**。服务配置位于 [`src/worker/ai/providers.ts`](src/worker/ai/providers.ts)，Cloudflare Workers AI 回落配置暂时已注释。

如需更换模型或添加服务，修改该文件中的模型、Chat Completions 接口地址和密钥名称。多个服务按数组顺序尝试，未配置密钥的服务会跳过，调用失败时尝试下一项。密钥值放在本地 `.dev.vars` 或 Cloudflare 的 Secrets 中。

## 开发与部署

使用 **Astro + TypeScript + Cloudflare Workers**。页面由 Astro 构建，Worker 处理 `/api/generate` 并提供请求限流。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动完整本地服务 |
| `npm run dev:ui` | 启动界面热更新服务 |
| `npm run check` | 类型检查、构建及部署预检查，不发布 |
| `npm run deploy` | 构建并发布到 Cloudflare Workers |

部署前，在 Cloudflare Worker 中配置 `GEMINI_API_KEY` Secret，例如运行 `npx wrangler secret put GEMINI_API_KEY`。部署到自己的账户时，请检查 [`wrangler.jsonc`](wrangler.jsonc) 中的 Worker 名称和限流 namespace，避免与其他项目共用。

主要代码位置：

| 路径 | 内容 |
| --- | --- |
| `src/pages/`、`src/components/`、`src/styles/` | 页面、组件与样式 |
| `src/client/` | 表单交互、API 请求和邮件状态识别 |
| `src/shared/` | 表单选项与输入校验 |
| `src/worker/` | 生成 API、AI 配置与提示词 |
| `public/` | 图片、图标等静态资源 |

## 使用须知

请核对 AI 生成的内容，并按照 [iRacing 官方申诉指南](https://support.iracing.com/support/solutions/articles/31000133441-how-to-file-a-protest) 自行提交文案和 Replay。ProtestMate 不会代为提交申诉，也与 iRacing.com Motorsport Simulations, LLC 无隶属关系。
