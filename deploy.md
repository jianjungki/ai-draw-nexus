# 部署指南

本项目使用 Cloudflare Pages 托管，通过连接 GitHub 仓库实现自动部署。

## 架构

- **前端**: Vite 应用，由 Cloudflare Pages 提供服务。
- **后端 API**: Cloudflare Functions，位于项目根目录的 `functions` 文件夹中。

Cloudflare Pages 会自动发现并部署 `functions` 目录下的所有函数，作为项目的后端 API。

## 部署

1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2.  进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3.  选择你的 GitHub 仓库 `ai-draw-nexus`
4.  配置构建设置：
    - **Framework preset**: Vite
    - **Build command**: `pnpm run build`
    - **Build output directory**: `dist`
5.  添加环境变量：
    - 进入 **Settings** → **Environment variables**
    - 添加以下 Secrets 以配置 AI 功能：

| 名称          | 说明                                      |
|---------------|-------------------------------------------|
| `AI_PROVIDER` | `openai` 或 `anthropic`                   |
| `AI_BASE_URL` | API 地址，如 `https://api.openai.com/v1`      |
| `AI_API_KEY`  | 你的 AI 提供商的 API 密钥                 |
| `AI_MODEL_ID` | 模型 ID，如 `gpt-4-turbo`                 |

6.  点击 **Save and Deploy**

部署完成后，你的应用和 API 就会上线。前端地址为 `https://<你的项目>.pages.dev`，后端函数则在 `https://<你的项目>.pages.dev/api/` 路径下可用。

## 实时协作功能

本项目包含一个通过 WebSocket 实现的实时协作功能。

- **实现**: 该功能由 `functions/api/collab.ts` 中的 Cloudflare Worker 提供支持。
- **部署**: 此 Worker 会作为项目的一部分，随 Cloudflare Pages 自动部署，无需额外步骤。
- **配置**: 实时协作功能不需要任何额外的环境变量或特殊配置。

## 自定义域名（可选）

在 Cloudflare Pages 项目的 **Custom domains** 选项卡中，你可以添加自己的域名。
