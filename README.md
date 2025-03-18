# 🦉 Owl

<p align="center">
  <img src="./images/logo.png" alt="Owl Logo" width="200"/>
  <br>
  <em>智慧对话的新境界 | A New Era of Intelligent Conversation</em>
</p>

<p align="center">
  <a href="#简介">简介</a> •
  <a href="#特性">特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#安装">安装</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#贡献">贡献</a> •
  <a href="#许可证">许可证</a>
</p>

---

## 简介

Owl是一款智能AI对话客户端，如同猫头鹰般带着敏锐的洞察力和深厚的智慧，为用户提供全方位的对话体验。无论是个人助理还是团队协作工具，Owl都能以其灵活多变的功能满足各类需求，让AI对话变得更加直观、高效且智能。

在信息爆炸的时代，Owl如同黑夜中的猫头鹰，以其敏锐的洞察力和深厚的智慧，为您过滤杂音，捕捉精华，让每一次对话都成为启发思考的契机。

## 特性

### 🧩 用户管理 - 个性化的智慧守护者

- 个性化用户配置文件，记录偏好设置和使用习惯
- 多级权限管理，确保数据安全与隐私保护
- 使用数据分析，智能推荐最适合的对话模式
- 账户同步功能，实现跨设备无缝体验

### 🌉 渠道管理 - 多维度的沟通之桥

- 支持创建多个专题渠道，针对不同领域分类管理
- 渠道自定义设置，包括背景、图标和特定响应风格
- 渠道标签系统，便于快速检索和分类
- 渠道使用统计，掌握各渠道活跃度和价值

### ⚙️ 模型管理 - 智慧引擎的调度中心

- 支持多种主流AI模型接入与切换
- 模型参数自定义，调整温度、创造力等核心参数
- 模型性能监控，实时了解响应速度和质量
- 智能模型推荐，根据对话内容自动选择最佳模型

### 💬 对话管理 - 智慧交流的记忆库

- 对话历史完整保存，随时回顾过往智慧火花
- 对话分类整理，建立个人知识库
- 关键内容标记与提取，捕捉重要信息
- 对话继续功能，无缝衔接之前的讨论脉络

### 🔄 渠道分享 - 智慧的传递与协作

- 一键分享渠道给团队成员或朋友
- 精细的分享权限控制，设置查看或编辑权限
- 共享渠道的协作编辑，实现团队智慧碰撞
- 分享数据统计，了解内容价值和影响力

## 安装

### 环境要求

- Node.js 18.x 或更高版本
- npm 7.x 或更高版本
- 现代浏览器（Chrome, Firefox, Safari, Edge）
- .NET 8.x 或更高版本

### 从源码构建


### 使用Docker

默认账号密码 `admin` `Aa123456.`
 
默认的Sqlite版本数据库文件路径为 `/app/data/Owl.Chat.db`，如果需要使用其他数据库，请修改环境变量 `ConnectionStrings:Type` 和 `ConnectionStrings:Default`。

```yaml
services:
  owl.chat:
    image: registry.cn-shenzhen.aliyuncs.com/token-ai/owl
    environment:
      - RunMigration=true
      - ConnectionStrings:Type=sqlite
      - ConnectionStrings:Default=Data Source=/app/data/Owl.Chat.db
      - Chat:App=您的外部可访问地址 # 例如：http://localhost:5000
    volumes:
      - ./wwwroot/images:/app/wwwroot/images
      - ./data:/app/data
```

如果写入到现有的Postgres数据库，修改环境变量 `ConnectionStrings:Type` 和 `ConnectionStrings:Default`。

```yaml 

services:
  owl.chat:
    image: registry.cn-shenzhen.aliyuncs.com/token-ai/owl
    environment:
      - RunMigration=true
      - ConnectionStrings:Type=postgresql
      - ConnectionStrings:Default=Host=postgres;Port=5432;Database=Owl-Chat;Username=postgres;Password=postgres
      - Chat:App=您的外部可访问地址 # 例如：http://localhost:5000
    volumes:
      - ./wwwroot/images:/app/wwwroot/images
```

```bash
docker-compose up -d
```

数据库支持：
- Sqlite
- Postgres
- SqlServer
- Dameng （达梦）
- MySql

## 使用指南

### 基础配置

1. 注册并登录您的Owl账户
2. 在设置页面中配置您的API密钥
3. 创建您的第一个对话渠道
4. 开始智能对话体验

### 高级用法

- **模型切换**：在对话界面右上角切换不同的AI模型
- **渠道管理**：使用侧边栏创建和管理不同主题的渠道
- **对话导出**：在对话页面使用导出按钮保存重要对话
- **团队协作**：在渠道设置中邀请团队成员共同参与

详细文档请访问我们的[Wiki页面](https://github.com/username/owl/wiki)。

## 贡献

我们欢迎各种形式的贡献，无论是新功能、文档改进还是问题报告！

1. Fork 该项目
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个Pull Request

请确保阅读我们的[贡献指南](CONTRIBUTING.md)和[行为准则](CODE_OF_CONDUCT.md)。

## 路线图

- [ ] 支持离线模式
- [ ] 添加更多AI模型集成
- [ ] 实现语音对话功能
- [ ] 增强数据分析和可视化

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

- 项目维护者: [token](mailto:239573049@qq.com)
- 官方网站: [http://owl.ai-v1.cn/](http://owl.ai-v1.cn/)

---

<p align="center">
  选择Owl，与智慧对话，让AI之光照亮您的决策与创造之路。
</p>
