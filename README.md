# find-dog 🐶

注册了一个好玩的域名，不干点啥有点浪费。于是就有了这个论坛彩蛋页——打开页面扫描动画 → 随机真狗图 → 留言墙。

## 技术栈

- **前端**：HTML/CSS/JS 单文件，GitHub Pages 托管
- **后端**：Cloudflare Workers + KV 存储
- **成本**：零

## 文件结构

```
├── public/
│   └── index.html       # 前端页面：扫描动画、狗图展示、留言墙
├── worker/
│   └── worker.js        # 后端 API：计数、留言增删查、狗图抓取、IP 限速
└── README.md
```

## 部署方式

前后端分离，分开部署：

### 前端 → GitHub Pages

Settings → Pages → Source: `Deploy from a branch` → 文件夹选 `/public`

### 后端 → Cloudflare Workers

1. Cloudflare 后台 → Workers & Pages → 创建 Worker
2. 粘贴 `worker/worker.js`
3. 创建 KV 命名空间 → 绑定到 Worker（变量名：`DOGKV`）
4. 绑自定义域名（workers.dev 域名国内不通）
5. 修改 `index.html` 第 172 行的 `API` 地址为你的 Worker 域名

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/count` | GET | 获取累计被抓次数 |
| `/api/hit` | POST | 增加一次计数（同浏览器 session 仅一次） |
| `/api/messages` | GET | 获取最新 20 条留言 |
| `/api/messages` | POST | 发表留言（60 字限制、IP 限速、内容过滤） |
| `/api/dog` | GET | 获取一张随机狗图（双源兜底） |

## 防护机制

| 层级 | 措施 |
|------|------|
| IP 限速 | 每 IP 每小时最多 3 条留言 |
| 内容过滤 | 拦截链接、网址、QQ号、微信号等 |
| 容量控制 | 最多保存 50 条留言，自动裁旧 |
| KV 额度 | Cloudflare 免费 1000 次写入/天，超了自动拒 |
| 前端降级 | API 失败自动切 emoji 兜底，不留裂图 |

## 免责声明

本项目仅用于个人技术实验和学习交流。页面上的留言墙内容为用户发布，不代表作者立场。
