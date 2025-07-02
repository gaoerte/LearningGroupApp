# 🚀 学习小组应用 - 完整部署指南

## 项目概览

这是一个基于 uni-app 开发的现代化学习小组应用，采用 Supabase 作为后端服务，支持微信小程序、H5 和 App 多端部署。

## 📋 目录结构

```text
LearningGroupApp/
├── api/                    # API 接口层
│   ├── supabase-v2.js     # 统一业务接口
│   └── ...
├── cloudfunctions/         # 云函数
│   └── supabaseProxy/     # Supabase 代理层
├── components/            # 组件库
│   ├── ModernCard.vue     # 现代化卡片
│   ├── ModernButton.vue   # 现代化按钮
│   └── ...
├── config/               # 配置文件
│   └── env.js           # 环境配置
├── database/            # 数据库
│   └── schema_v2_optimized.sql
├── pages/               # 页面
├── styles/              # 样式
├── utils/               # 工具库
└── docs/               # 文档
```

## 🛠️ 技术栈

- **前端框架**: uni-app (Vue 3)
- **构建工具**: Vite
- **后端服务**: Supabase
- **云函数**: 微信云开发
- **样式**: SCSS + 现代化设计
- **状态管理**: Vuex

## 📦 环境准备

### 1. 开发环境要求

- **Node.js**: >= 16.0.0
- **pnpm**: >= 7.0.0 (推荐) 或 npm >= 8.0.0
- **HBuilderX**: 最新版本
- **微信开发者工具**: 最新版本

### 2. 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

## 🔧 配置指南

### 1. 环境配置

修改 `config/env.js` 文件：

```javascript
const configs = {
  development: {
    apiBaseUrl: 'https://your-dev-api.com',
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    cloudFunctionEnv: 'your-dev-env',
    // ...
  },
  production: {
    apiBaseUrl: 'https://your-api.com',
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    cloudFunctionEnv: 'your-prod-env',
    // ...
  }
};
```

### 2. Supabase 配置

#### 2.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和 API Keys

#### 2.2 初始化数据库

```sql
-- 执行 database/schema_v2_optimized.sql
-- 在 Supabase SQL Editor 中运行
```

#### 2.3 配置云函数代理

修改 `cloudfunctions/supabaseProxy/index.js`：

```javascript
const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  serviceKey: 'your-service-role-key'
};
```

### 3. 微信小程序配置

#### 3.1 配置 manifest.json

```json
{
  "mp-weixin": {
    "appid": "your-appid",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "enhance": true
    },
    "usingComponents": true
  }
}
```

#### 3.2 配置云开发

1. 在微信公众平台开通云开发
2. 部署云函数到云开发环境
3. 配置云函数权限和环境变量

## 🚀 部署流程

### 1. 微信小程序部署

#### 1.1 开发环境

```bash
# 构建小程序
npm run build:mp-weixin

# 或开发模式
npm run dev:mp-weixin
```

#### 1.2 云函数部署

```bash
# 在微信开发者工具中
1. 打开云开发控制台
2. 创建云环境
3. 部署 cloudfunctions/supabaseProxy
4. 配置环境变量
```

#### 1.3 发布流程

1. **提交审核**
   ```bash
   # 确保代码无误
   npm run build:mp-weixin
   ```

2. **上传代码**
   - 在微信开发者工具中上传代码
   - 填写版本号和项目备注

3. **提交审核**
   - 在微信公众平台提交审核
   - 填写功能介绍和测试账号

### 2. H5 部署

#### 2.1 构建

```bash
# 构建 H5 版本
npm run build:h5
```

#### 2.2 部署到服务器

```bash
# 上传 dist/build/h5 目录到服务器
scp -r dist/build/h5/* user@server:/var/www/html/

# 或使用 nginx 配置
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. App 部署

#### 3.1 构建

```bash
# 构建 App
npm run build:app
```

#### 3.2 原生打包

1. **Android**
   ```bash
   # 在 HBuilderX 中
   1. 发行 -> 原生App-云打包
   2. 选择 Android 平台
   3. 配置签名证书
   4. 提交打包
   ```

2. **iOS**
   ```bash
   # 在 HBuilderX 中
   1. 发行 -> 原生App-云打包
   2. 选择 iOS 平台
   3. 配置证书和描述文件
   4. 提交打包
   ```

## 🔐 安全配置

### 1. Supabase 安全

#### 1.1 RLS (行级安全)

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "用户只能访问自己的数据" ON users
FOR ALL USING (auth.uid() = id);
```

#### 1.2 API Keys 管理

- **Anon Key**: 用于前端公开访问
- **Service Role Key**: 用于云函数服务端访问
- 定期轮换密钥

### 2. 云函数安全

```javascript
// cloudfunctions/supabaseProxy/index.js
exports.main = async (event, context) => {
  // 验证请求来源
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) {
    return { success: false, error: '未授权访问' };
  }
  
  // 处理业务逻辑
  // ...
};
```

## 📊 监控和性能

### 1. 性能监控

```javascript
// 在 main.js 中启用性能监控
import { perf } from '@/utils/performance';

// 开发环境启用
if (process.env.NODE_ENV === 'development') {
  perf.setEnabled(true);
}
```

### 2. 错误监控

```javascript
// 全局错误处理
App.onError = (error) => {
  console.error('全局错误:', error);
  // 可接入第三方错误监控服务
};
```

### 3. 数据库监控

- 在 Supabase Dashboard 中查看数据库性能
- 监控 API 调用频率和响应时间
- 设置告警阈值

## 🧪 测试指南

### 1. 功能测试

访问测试页面：`pages/test/supabaseTest.vue`

```javascript
// 测试后端连接
await testConnection();

// 测试用户 API
await testUserAPI();

// 测试打卡 API
await testCheckinAPI();
```

### 2. 性能测试

```javascript
// 获取性能报告
const report = perf.getReport();
console.log('性能报告:', report);
```

### 3. 兼容性测试

- **微信小程序**: 真机调试和体验版测试
- **H5**: 多浏览器兼容性测试
- **App**: iOS 和 Android 真机测试

## 🔄 持续集成

### 1. GitHub Actions 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build H5
      run: npm run build:h5
      
    - name: Deploy to server
      run: |
        # 部署脚本
```

### 2. 自动化测试

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --config jest.unit.config.js",
    "test:e2e": "cypress run",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

## 📝 维护指南

### 1. 版本管理

```bash
# 语义化版本控制
npm version patch  # 修复 bug
npm version minor  # 新功能
npm version major  # 重大更新
```

### 2. 数据库迁移

```sql
-- 创建迁移文件
-- migrations/001_add_user_tags.sql
ALTER TABLE users ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;
```

### 3. 备份策略

- **数据库**: Supabase 自动备份 + 定期手动备份
- **代码**: Git 版本控制 + 定期打标签
- **资源文件**: 云存储备份

## ❓ 故障排除

### 1. 常见问题

#### 1.1 云函数调用失败

```javascript
// 检查云函数配置
console.log('云函数环境:', wx.cloud.envList);

// 检查权限配置
wx.cloud.callFunction({
  name: 'supabaseProxy',
  data: { action: 'test' }
}).then(console.log).catch(console.error);
```

#### 1.2 Supabase 连接失败

```javascript
// 检查网络连接
await fetch('https://your-project.supabase.co/rest/v1/')
  .then(res => console.log('连接状态:', res.status))
  .catch(err => console.error('连接失败:', err));
```

#### 1.3 样式问题

```scss
// 检查 SCSS 编译
@import "@/styles/variables.scss";

.test-class {
  color: $primary-color;
}
```

### 2. 日志查看

```javascript
// 开发环境日志
import { ENV_UTILS } from '@/config/env';

ENV_UTILS.log.debug('调试信息');
ENV_UTILS.log.error('错误信息');
```

### 3. 性能调优

```javascript
// 查看性能报告
const report = perf.getReport();

// 优化建议
if (report.summary.avgRequestTime > 1000) {
  console.warn('请求响应时间过长，建议优化');
}
```

## 📞 技术支持

### 开发团队联系方式

- **项目负责人**: [联系方式]
- **技术支持**: [联系方式]
- **文档维护**: [联系方式]

### 相关资源

- [uni-app 官方文档](https://uniapp.dcloud.io/)
- [Supabase 文档](https://supabase.com/docs)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/)

---

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

---

**最后更新**: 2024年12月
