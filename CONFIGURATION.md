# 小说改编助手配置指南

本文档说明如何配置小说改编助手的各项设置。

## Claude API 配置

### 获取 API Key

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册或登录账户
3. 导航到 **API Keys** 页面
4. 点击 **Create Key** 创建新的 API Key
5. 复制并安全保存 API Key（只显示一次）

### 配置 API Key

#### 选项 1: Worker 环境变量（推荐）

在 Cloudflare Worker 中配置环境变量：

```bash
变量名: CLAUDE_API_KEY
值: sk-ant-api03-xxxxxxxxxxxxxxxxxxxx
```

**步骤：**
1. 打开 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择你的 Worker
4. 点击 Settings → Variables
5. 在 Environment Variables 部分添加变量
6. 点击 Save and Deploy

**优点：**
- 更安全
- 不会暴露在客户端
- 便于管理和更新

#### 选项 2: 应用内配置

在小说改编助手的设置页面直接输入：

1. 访问 `novel-adapter.html`
2. 点击左侧导航的 **设置**
3. 在 "Claude API Key" 输入框中输入 API Key
4. 点击 **保存设置**

**注意：**
- API Key 会存储在 Cloudflare KV 中
- 确保只有授权用户可以访问
- 不建议在共享环境中使用

## 模型选择

### 可用模型

| 模型 | 特点 | 适用场景 | 成本 |
|------|------|---------|------|
| Claude 3.5 Sonnet | 平衡性能和质量 | **推荐使用** | 中等 |
| Claude 3 Opus | 最高质量 | 专业创作 | 较高 |
| Claude 3 Haiku | 最快速度 | 快速原型 | 较低 |

### 配置方法

在设置页面的 **模型选择** 下拉菜单中选择合适的模型。

## KV 存储配置

### KV 命名空间设置

确保在 Worker 中绑定了 KV 命名空间：

```
变量名: MY_HOME_KV
KV 命名空间: 你创建的 KV 命名空间
```

### 数据结构

系统使用以下 KV 键：

```javascript
// 项目数据
novel_projects = [
  {
    id: "项目ID",
    name: "项目名称",
    sourceContent: "原文内容",
    status: "状态",
    analysis: {},
    script: "剧本内容",
    characters: [],
    relationshipGraph: "",
    createdAt: "创建时间",
    updatedAt: "更新时间"
  }
]

// 设置数据
novel_adapter_settings = {
  apiKey: "API密钥（加密存储）",
  model: "使用的模型"
}
```

## 高级配置

### 自定义提示词

如果需要自定义 Claude 的提示词，可以修改 `worker.js` 中的以下部分：

**改编分析提示词：**
```javascript
const systemPrompt = `你是一位专业的小说改编专家...`;
```
位置：`handleAnalyzeNovel` 函数

**剧本生成提示词：**
```javascript
const systemPrompt = `你是一位专业的短剧编剧...`;
```
位置：`handleGenerateScript` 函数

**角色档案提示词：**
```javascript
const systemPrompt = `你是一位专业的角色分析师...`;
```
位置：`handleCharacterProfile` 函数

### 文本长度限制

默认限制：

```javascript
// 分析时的内容截断
content.substring(0, 20000)  // 20,000 字符

// 剧本生成时的内容截断
project.sourceContent?.substring(0, 15000)  // 15,000 字符

// 角色档案时的内容截断
project.script?.substring(0, 10000)  // 10,000 字符
```

如需调整，修改 `worker.js` 中对应的数值。

### API 超时设置

默认 Claude API 调用没有明确的超时设置。如需添加：

```javascript
async function callClaudeAPI(apiKey, prompt, systemPrompt = '') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60秒超时
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({...}),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    // ... rest of code
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}
```

### 速率限制

为防止滥用，可以添加速率限制：

```javascript
// 在 handleRequest 开始处添加
async function checkRateLimit(request, kv) {
  const ip = request.headers.get('CF-Connecting-IP');
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowMs = 3600000; // 1小时
  const maxRequests = 10;
  
  const data = await kv.get(key, { type: 'json' }) || { count: 0, resetAt: now + windowMs };
  
  if (now > data.resetAt) {
    data.count = 1;
    data.resetAt = now + windowMs;
  } else {
    data.count++;
  }
  
  await kv.put(key, JSON.stringify(data), { expirationTtl: windowMs / 1000 });
  
  return data.count <= maxRequests;
}
```

## 安全配置

### API Key 加密

生产环境中建议对存储的 API Key 进行加密：

```javascript
// 加密
async function encryptApiKey(apiKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return { encrypted, iv, key };
}

// 解密
async function decryptApiKey(encrypted, iv, key) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
```

### CORS 限制

如果只允许特定域名访问 API：

```javascript
// 在 handleRequest 中添加
const allowedOrigins = [
  'https://your-domain.com',
  'https://your-pages.pages.dev'
];

const origin = request.headers.get('Origin');
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
```

### 输入清理

添加输入验证和清理：

```javascript
function sanitizeInput(text) {
  // 移除潜在的危险字符
  return text
    .replace(/[<>]/g, '')  // 移除 HTML 标签
    .replace(/javascript:/gi, '')  // 移除 JavaScript 协议
    .trim();
}
```

## 性能优化

### 缓存策略

对常见查询实施缓存：

```javascript
// 缓存分析结果
const cacheKey = `analysis_cache:${hashContent(content)}`;
const cached = await kv.get(cacheKey, { type: 'json' });

if (cached && Date.now() - cached.timestamp < 86400000) {
  return cached.data;
}

// ... 进行分析 ...

await kv.put(cacheKey, JSON.stringify({
  data: analysis,
  timestamp: Date.now()
}), { expirationTtl: 86400 }); // 24小时过期
```

### 批量操作

对多个项目的操作使用批量处理：

```javascript
async function batchGetProjects(projectIds, kv) {
  const promises = projectIds.map(id => 
    kv.get(`project:${id}`, { type: 'json' })
  );
  return await Promise.all(promises);
}
```

## 监控配置

### 日志级别

设置不同的日志级别：

```javascript
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;

function log(level, message, data = null) {
  if (level >= CURRENT_LOG_LEVEL) {
    console.log(`[${Object.keys(LOG_LEVEL)[level]}]`, message, data || '');
  }
}
```

### 错误追踪

添加错误追踪：

```javascript
async function trackError(error, context, kv) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  };
  
  // 存储到 KV 或发送到外部服务
  const errorKey = `error:${Date.now()}`;
  await kv.put(errorKey, JSON.stringify(errorLog), { expirationTtl: 604800 }); // 7天
}
```

## 故障恢复

### 自动重试

为 API 调用添加重试机制：

```javascript
async function callWithRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

// 使用
const result = await callWithRetry(() => callClaudeAPI(apiKey, prompt));
```

### 数据备份

定期备份重要数据：

```javascript
async function backupProjects(kv) {
  const projects = await kv.get('novel_projects', { type: 'json' });
  const backupKey = `backup:projects:${Date.now()}`;
  await kv.put(backupKey, JSON.stringify(projects), { expirationTtl: 2592000 }); // 30天
}
```

## 环境变量总结

| 变量名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `MY_HOME_KV` | KV Binding | 是 | KV 命名空间绑定 |
| `CLAUDE_API_KEY` | String | 推荐 | Claude API 密钥 |

## 配置检查清单

部署前请确认：

- [ ] KV 命名空间已创建并绑定
- [ ] Claude API Key 已配置（环境变量或应用内）
- [ ] Worker 代码已部署
- [ ] 前端文件已上传
- [ ] 测试上传功能正常
- [ ] 测试分析功能正常
- [ ] 测试剧本生成功能正常
- [ ] 导出功能正常
- [ ] 项目管理功能正常

## 获取帮助

如遇到配置问题：

1. 检查 Worker 日志
2. 查看浏览器控制台
3. 阅读 [部署指南](DEPLOYMENT_GUIDE.md)
4. 查看 [使用手册](NOVEL_ADAPTER_README.md)
5. 提交 Issue 到 GitHub

---

**配置完成后，尽情享受 AI 创作的乐趣！** ✨
