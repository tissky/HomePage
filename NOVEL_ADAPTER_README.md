# 小说改编助手 - Novel Adaptation Assistant

一个基于 Claude AI 的智能小说改编系统，可以将小说内容改编为短剧剧本。

## 功能特点

### 核心功能

1. **文件上传模块**
   - 支持 .txt 文件上传
   - 支持直接粘贴文本内容
   - 拖拽上传支持

2. **改编分析**
   - 原文概要提取
   - 核心剧情分析
   - 人物梳理
   - 情感基调把握
   - 改编重点建议
   - 难点分析
   - 场次规划

3. **剧本生成**
   - 基于 Claude AI 的智能剧本创作
   - 标准短剧格式
   - 6-12集结构设计
   - 每集2-5分钟时长

4. **智能指令**
   - `/分析` - 改编质量分析
   - `/改编` - 重新改编剧本
   - `/角色档案` - 查看角色详细信息
   - `/关系图` - 角色关系可视化

5. **项目管理**
   - 创建和管理多个项目
   - 历史记录保存
   - 项目状态追踪
   - 一键删除项目

6. **导出功能**
   - Markdown 格式导出
   - 纯文本导出
   - JSON 数据导出

7. **改编工作流**
   - 步骤1：内容检查
   - 步骤2：改编分析
   - 步骤3：用户确认
   - 步骤4：剧本生成
   - 步骤5：编辑优化

## 使用方法

### 1. 配置 Claude API Key

首次使用需要配置 Claude API Key：

1. 访问 `novel-adapter.html`
2. 点击左侧导航的"设置"
3. 输入您的 Claude API Key
4. 选择模型（推荐使用 Claude 3.5 Sonnet）
5. 点击"保存设置"

**获取 API Key：**
- 访问 [Anthropic Console](https://console.anthropic.com/)
- 注册并创建 API Key
- 或者在 Cloudflare Worker 环境变量中配置 `CLAUDE_API_KEY`

### 2. 创建新项目

1. 点击"新建项目"
2. 输入项目名称
3. 上传 .txt 文件或直接粘贴小说内容
4. 点击"开始分析"

### 3. 查看分析结果

系统会调用 Claude AI 进行深度分析，包括：
- 原文概要
- 核心剧情
- 人物梳理
- 情感基调
- 改编重点
- 难点分析
- 场次规划

### 4. 生成剧本

1. 审阅分析结果
2. 点击"确认并生成剧本"
3. 等待 Claude AI 生成完整剧本
4. 查看和编辑生成的剧本

### 5. 使用高级功能

**角色档案：**
点击右侧面板的"角色档案"按钮，查看每个角色的详细信息。

**关系图：**
点击"关系图"按钮，生成角色关系的 Mermaid 图表。

**质量分析：**
点击"分析"按钮，对改编质量进行8维度评估。

### 6. 导出剧本

1. 点击右侧面板的导出按钮
2. 选择导出格式（Markdown/TXT/JSON）
3. 文件将自动下载

## 技术架构

### 前端
- **HTML/CSS/JavaScript** - 纯原生实现
- **响应式设计** - 适配各种屏幕尺寸
- **模块化布局** - 左中右三栏布局

### 后端
- **Cloudflare Workers** - 无服务器计算平台
- **Cloudflare KV** - 数据持久化存储
- **Claude API** - AI 能力支持

### API 端点

```
GET  /api/novel/projects              - 获取所有项目
POST /api/novel/projects              - 创建新项目
GET  /api/novel/projects/:id          - 获取特定项目
PUT  /api/novel/projects/:id          - 更新项目
DELETE /api/novel/projects/:id        - 删除项目

POST /api/novel/analyze               - 分析小说内容
POST /api/novel/generate-script       - 生成剧本
POST /api/novel/analyze-quality       - 质量分析
POST /api/novel/character-profile     - 角色档案
POST /api/novel/relationship-graph    - 关系图

GET  /api/novel/settings              - 获取设置
POST /api/novel/settings              - 保存设置
```

## 数据模型

### Project（项目）
```javascript
{
  id: string,
  name: string,
  sourceContent: string,
  status: 'draft' | 'analyzing' | 'analyzed' | 'generating' | 'completed',
  analysis: object,
  script: string,
  characters: array,
  relationshipGraph: string,
  createdAt: string,
  updatedAt: string
}
```

### Analysis（分析）
```javascript
{
  summary: string,          // 原文概要
  corePlot: string,         // 核心剧情
  characters: string,       // 人物梳理
  emotionalTone: string,    // 情感基调
  adaptationFocus: string,  // 改编重点
  challenges: string,       // 难点分析
  sceneStructure: string    // 场次规划
}
```

### Character（角色）
```javascript
{
  name: string,
  role: string,
  personality: string,
  goal: string,
  arc: string,
  description: string
}
```

## 改编要求（8个维度）

Claude AI 遵循以下8个核心改编原则：

1. **精髓理解** - 提炼故事核心主题和情感内核
2. **结构设计** - 规划短剧的整体结构和节奏
3. **人物塑造** - 分析主要角色的性格特征和发展弧线
4. **冲突设置** - 识别和强化戏剧冲突
5. **情感共鸣** - 保持原作的情感力量
6. **视觉表达** - 将文字转化为视觉场景
7. **节奏把控** - 适应短剧的快节奏特点
8. **创新改编** - 在尊重原作基础上进行必要创新

## 部署配置

### Cloudflare Worker 环境变量

可选配置 Worker 环境变量：

```bash
CLAUDE_API_KEY=your-claude-api-key-here
```

如果不配置环境变量，用户需要在设置页面中输入 API Key。

### KV 命名空间

系统使用以下 KV 键：

- `novel_projects` - 存储所有项目数据
- `novel_adapter_settings` - 存储用户设置

确保已绑定 KV 命名空间 `MY_HOME_KV`。

## 使用限制

- **文本长度**：建议单个小说内容不超过 20,000 字符（Claude API 限制）
- **文件格式**：仅支持 .txt 纯文本文件
- **API 调用**：取决于您的 Claude API 配额
- **存储空间**：KV 存储有免费额度限制

## 故障排查

### 问题：API Key 错误

**解决方法：**
1. 检查 API Key 是否正确
2. 确认 API Key 权限
3. 查看 Claude API 配额

### 问题：分析失败

**解决方法：**
1. 检查小说内容是否过长
2. 确认网络连接正常
3. 查看浏览器控制台错误信息

### 问题：项目无法加载

**解决方法：**
1. 刷新页面
2. 检查 KV 绑定是否正确
3. 清除浏览器缓存

## 最佳实践

1. **内容准备**
   - 确保小说内容完整且格式清晰
   - 建议先进行基本的文本清理
   - 控制内容长度在合理范围内

2. **项目管理**
   - 为项目取有意义的名称
   - 定期导出重要项目
   - 及时删除不需要的项目

3. **改编优化**
   - 仔细审阅分析结果
   - 利用编辑功能优化剧本
   - 使用质量分析功能评估改编效果

## 技术支持

如有问题或建议，请：
- 查看浏览器控制台日志
- 检查 Worker 日志
- 提交 Issue 到项目仓库

## 许可证

本项目基于现有 HomePage 项目的许可证。

---

**享受智能改编之旅！** 🎬✨
