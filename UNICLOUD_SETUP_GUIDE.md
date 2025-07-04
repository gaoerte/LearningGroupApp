# uniCloud 云服务开通和配置指南

## 📋 概述
您需要开通 uniCloud 云服务来使用云函数功能。uniCloud 是 uni-app 官方的云服务平台，与微信云函数不同。

## 🚀 开通步骤

### 1. 注册和登录 uniCloud
1. 访问：https://unicloud.dcloud.net.cn/
2. 使用 DCloud 账号登录（与 HBuilderX 同账号）
3. 如果没有账号，先注册一个

### 2. 创建云服务空间
1. 登录后点击"新建云服务空间"
2. 选择服务商：
   - **阿里云**：免费额度较多，推荐新手
   - **腾讯云**：与微信生态集成更好
3. 填写空间名称：例如 `learning-group-app`
4. 选择地域：建议选择距离您较近的地域

### 3. 在 HBuilderX 中关联云服务空间
1. 在 HBuilderX 中右键项目根目录
2. 选择"关联云服务空间或项目"
3. 选择刚才创建的云服务空间
4. 会自动生成 `uniCloud-aliyun` 或 `uniCloud-tcb` 目录

## 📁 项目结构调整

### 当前问题
您的云函数目录结构：
```
cloudfunctions/
├── supabaseTest/
│   ├── index.js
│   └── package.json
└── userData/
    ├── index.js
    └── package.json
```

### 需要调整为
```
uniCloud-aliyun/  # 或 uniCloud-tcb
├── cloudfunctions/
│   ├── supabaseTest/
│   │   ├── index.js
│   │   └── package.json
│   └── userData/
│       ├── index.js
│       └── package.json
└── database/
    └── db_init.json
```

## 🔧 配置步骤

### 1. 移动云函数文件
将现有的 `cloudfunctions` 目录内容移动到 `uniCloud-aliyun/cloudfunctions/` 下

### 2. 安装依赖和部署
1. 右键 `supabaseTest` 云函数
2. 选择"上传并运行"
3. 如果有依赖包，会自动安装

### 3. 测试云函数
```javascript
// 在项目中调用云函数
uniCloud.callFunction({
  name: 'supabaseTest',
  data: { action: 'ping' },
  success: (res) => {
    console.log('云函数调用成功:', res);
  },
  fail: (err) => {
    console.error('云函数调用失败:', err);
  }
});
```

## 💰 费用说明

### 免费额度（阿里云）
- 云函数：100万次/月 免费调用
- 数据库：1GB 存储 + 5GB 流量
- 云存储：5GB 存储 + 15GB CDN 流量

### 免费额度（腾讯云）
- 云函数：100万次/月 免费调用
- 数据库：2GB 存储 + 5GB 流量
- 云存储：5GB 存储 + 10GB CDN 流量

对于开发和小规模使用，免费额度完全够用！

## 🔗 快速开始命令

### 方案1：使用 HBuilderX 图形界面（推荐）
1. 右键项目 → "关联云服务空间"
2. 右键云函数 → "上传并运行"
3. 在控制台查看日志

### 方案2：使用 uniCloud CLI
```bash
# 安装 CLI 工具
npm install -g @dcloudio/unicloud

# 登录账号
unicloud login

# 初始化项目
unicloud init

# 部署云函数
unicloud deploy
```

## ⚠️ 注意事项

1. **不要混用微信云函数**：
   - 您提到的"微信云函数"是微信小程序原生云开发
   - uni-app 项目需要使用 uniCloud
   - 两者不兼容

2. **选择合适的服务商**：
   - 如果主要面向微信小程序：选择腾讯云
   - 如果是多端应用：选择阿里云

3. **开发调试**：
   - 本地调试：使用 HBuilderX 的云函数调试功能
   - 线上调试：在 uniCloud 控制台查看日志

## 🎯 下一步操作

1. **立即开通**：访问 https://unicloud.dcloud.net.cn/ 开通服务
2. **关联项目**：在 HBuilderX 中关联云服务空间
3. **移动文件**：将云函数移动到正确的目录
4. **部署测试**：上传云函数并测试连接

完成这些步骤后，您就可以正常使用云函数了！
