# 🚀 学习小组应用 - 快速启动指南

## 📋 项目概述

这是一个基于 uni-app 开发的现代化学习小组应用，采用 Supabase 作为后端服务，支持微信小程序、H5 和 App 多端运行。

## ⚡ 快速开始

### 1. 环境准备

```bash
# 检查 Node.js 版本 (需要 >= 16.0.0)
node --version

# 检查 npm 版本
npm --version

# 全局安装 uni-app CLI (如果没有)
npm install -g @dcloudio/uni-cli
```

### 2. 项目安装

```bash
# 克隆项目 (或下载项目文件)
cd LearningGroupApp

# 安装依赖
npm install

# 或使用 pnpm (推荐)
pnpm install
```

### 3. 配置环境

#### 3.1 修改环境配置
编辑 `config/env.js`：

```javascript
const configs = {
  development: {
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    cloudFunctionEnv: 'your-dev-env',
    // ...
  },
  production: {
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    cloudFunctionEnv: 'your-prod-env',
    // ...
  }
};
```

#### 3.2 配置 Supabase
1. 访问 [Supabase](https://supabase.com) 创建项目
2. 执行 `database/schema_v2_optimized.sql` 初始化数据库
3. 获取项目 URL 和 API Keys

#### 3.3 配置云函数
编辑 `cloudfunctions/supabaseProxy/index.js`：

```javascript
const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  serviceKey: 'your-service-role-key'
};
```

### 4. 运行项目

#### 4.1 微信小程序
```bash
# 开发模式
npm run dev:mp-weixin

# 构建模式
npm run build:mp-weixin
```

然后在微信开发者工具中打开 `dist/dev/mp-weixin` 目录。

#### 4.2 H5 网页版
```bash
# 开发模式
npm run dev:h5

# 构建模式
npm run build:h5
```

访问 `http://localhost:3000` 查看应用。

#### 4.3 App 应用
```bash
# 开发模式
npm run dev:app

# 构建模式
npm run build:app
```

使用 HBuilderX 进行真机调试或云打包。

## 🔧 开发工具

### 测试页面
访问 `/pages/test/supabaseTest` 页面进行：
- 后端连接测试
- API 功能测试
- 性能监控查看
- 错误处理测试

### 开发命令
```bash
# 代码检查
npm run lint

# 格式化代码
npm run format

# 类型检查
npm run type-check

# 运行测试
npm run test
```

## 📱 功能模块

### 核心功能
- 👤 **用户系统**: 微信授权登录、个人资料管理
- 📅 **学习打卡**: 每日学习记录、统计分析
- 👥 **学习小组**: 群组创建、搜索、聊天功能
- 🤖 **AI 助手**: 智能问答、学习建议

### 系统功能
- 📊 **性能监控**: 实时性能分析和优化建议
- 🔔 **通知系统**: 多端通知推送和管理
- 💾 **缓存管理**: 智能缓存策略和数据管理
- 🛡️ **错误处理**: 全局错误捕获和用户友好提示

## 🏗️ 项目结构

```
LearningGroupApp/
├── api/              # API 接口层
├── components/       # 组件库
├── pages/           # 页面文件
├── styles/          # 样式系统
├── utils/           # 工具库
├── config/          # 配置管理
├── cloudfunctions/  # 云函数
└── docs/           # 项目文档
```

## 📚 重要文件

### 配置文件
- `pages.json` - 页面路由配置
- `manifest.json` - 应用清单配置
- `vite.config.js` - 构建配置
- `config/env.js` - 环境配置

### 核心文件
- `api/supabase-v2.js` - 统一 API 接口
- `utils/performance.js` - 性能监控工具
- `utils/errorHandler.js` - 错误处理工具
- `utils/cacheManager.js` - 缓存管理工具

## 🚀 部署指南

### 微信小程序部署
1. 在微信开发者工具中上传代码
2. 在微信公众平台提交审核
3. 审核通过后发布上线

### H5 部署
1. 执行 `npm run build:h5`
2. 将 `dist/build/h5` 目录上传到服务器
3. 配置 nginx 或其他 web 服务器

### App 部署
1. 在 HBuilderX 中选择"发行 -> 原生App-云打包"
2. 配置签名证书和应用信息
3. 提交打包，下载安装包

## 🛠️ 故障排除

### 常见问题

#### 1. 云函数调用失败
```javascript
// 检查云函数环境配置
console.log('云函数环境:', wx.cloud.envList);
```

#### 2. Supabase 连接失败
```javascript
// 检查网络连接和配置
await fetch('https://your-project.supabase.co/rest/v1/')
  .then(res => console.log('连接状态:', res.status))
  .catch(err => console.error('连接失败:', err));
```

#### 3. 样式不显示
- 检查 `styles/variables.scss` 是否正确导入
- 确认 `vite.config.js` 中的 SCSS 配置
- 清除缓存重新构建

#### 4. 页面跳转失败
- 检查 `pages.json` 中的路径配置
- 确认页面文件是否存在
- 查看控制台错误信息

### 调试工具
```javascript
// 开启性能监控
import { perf } from '@/utils/performance';
perf.setEnabled(true);

// 查看错误日志
import { errorHandler } from '@/utils/errorHandler';
console.log(errorHandler.getStats());

// 查看缓存状态
import { cache } from '@/utils/cacheManager';
console.log(cache.getStats());
```

## 📞 技术支持

### 文档资源
- [完整部署指南](./docs/DEPLOYMENT_GUIDE.md)
- [Supabase 后端指南](./docs/SUPABASE_BACKEND_GUIDE.md)
- [项目优化总结](./FINAL_OPTIMIZATION_SUMMARY.md)

### 在线资源
- [uni-app 官方文档](https://uniapp.dcloud.io/)
- [Supabase 文档](https://supabase.com/docs)
- [Vue 3 文档](https://vuejs.org/)

### 问题反馈
- GitHub Issues: [项目地址]
- 技术交流群: [群组二维码]
- 邮件支持: support@example.com

---

## 🎉 开始开发

现在你已经准备好开始开发了！这个项目提供了完整的开发工具和最佳实践，让你可以专注于业务逻辑的实现。

建议从以下步骤开始：

1. **熟悉项目结构** - 浏览主要目录和文件
2. **运行测试页面** - 验证环境配置是否正确
3. **查看示例代码** - 了解编码规范和最佳实践
4. **开始开发功能** - 基于现有架构添加新功能

祝你开发愉快！🚀

---

**更新时间**: 2025年7月2日  
**文档版本**: v1.0.0
