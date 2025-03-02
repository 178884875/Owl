
#  Chat Web 前端项目

## 项目简介

 Chat 是一个支持多模型、多渠道的 AI 聊天应用。本仓库包含了  Chat 的前端部分代码。

## 主要功能

- 多模型支持
  - OpenAI 系列模型(GPT-3.5/GPT-4等)
  - DeepSeek 系列模型
  - Google 模型
  - 通义千问系列模型(Qwen2.5等)

- 多模态能力
  - 支持图片输入输出
  - 支持音频输入输出
  - 支持视频理解
  - 支持文档处理

- 渠道管理
  - 支持多渠道配置
  - 渠道密钥管理
  - 渠道共享功能
  - 渠道测试功能

- 用户系统
  - 用户注册登录
  - JWT 鉴权
  - 角色权限管理

- 文件存储
  - 支持文件上传下载
  - 支持多种文件类型
  - 文件安全存储

## 技术栈

- 前端框架: [待补充]
- UI 组件库: [待补充] 
- 状态管理: [待补充]
- HTTP 请求: [待补充]

## 开发环境搭建

1. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

2. 启动开发服务器

```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

## 项目结构

```
src/
  ├── components/     # 公共组件
  ├── pages/         # 页面组件
  ├── services/      # API 服务
  ├── stores/        # 状态管理
  ├── styles/        # 样式文件
  └── utils/         # 工具函数
```

## 环境变量配置

创建 `.env` 文件:

```env
VITE_API_URL=http://localhost:5000
```

## 构建部署

```bash
# 构建生产环境
npm run build

# 预览构建结果
npm run preview
```

## 接口文档

主要接口包括:

- 验证码接口 `/api/Verification`
- 文件存储接口 `/api/FileStorage`
- 模型渠道接口 `/api/ModelChannel`
- 聊天接口 `/api/Chat`

详细接口文档请参考后端 Swagger 文档。

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证
