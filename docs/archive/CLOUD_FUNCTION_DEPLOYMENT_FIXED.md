# 云函数部署完整指南

## ✅ 问题已修复

我们已经成功修复了以下问题：
1. ✅ Vite 配置中的 `this.copyCloudFunctions is not a function` 错误
2. ✅ ES 模块中 `__dirname` 不可用的问题
3. ✅ 云函数自动复制功能已经正常工作

## 🚀 当前状态

### 已完成的工作：
- ✅ 修复了 `vite.config.js` 中的插件上下文问题
- ✅ 创建了独立的云函数复制脚本 `scripts/copy-cloud-functions.js`
- ✅ 云函数已成功复制到构建目录
- ✅ 在 `package.json` 中添加了便捷的复制命令

### 可用的云函数：
- ✅ `supabaseProxy` - 完整版 Supabase 代理
- ✅ `supabaseProxySimple` - 简化版 Supabase 代理
- ✅ `supabaseTest` - 测试用云函数
- ✅ `testProxy` - 通用测试代理
- ✅ `userData` - 用户数据处理
- ✅ `wechatLogin` - 微信登录处理

## 🔧 部署步骤

### 方法1：使用 npm 脚本（推荐）
```bash
# 复制云函数到构建目录
npm run copy-cloudfunctions

# 或者直接运行部署命令
npm run deploy:mp-weixin
```

### 方法2：直接运行脚本
```bash
node scripts/copy-cloud-functions.js
```

### 方法3：构建时自动复制
Vite 插件会在构建时自动复制云函数（如果构建成功）。

## 📱 微信开发者工具部署

1. **打开项目**
   - 在微信开发者工具中打开你的项目
   - 确保项目路径指向 `unpackage/dist/dev/mp-weixin` 或 `unpackage/dist/build/mp-weixin`

2. **找到云函数文件夹**
   - 在项目结构中应该能看到 `cloudfunctions` 文件夹
   - 展开后会看到 6 个云函数子文件夹

3. **部署云函数**
   - 右键点击 `cloudfunctions` 文件夹
   - 选择 "上传并部署：云端安装依赖"
   - 或者可以单独部署每个云函数

4. **验证部署**
   - 在云开发控制台中检查云函数是否部署成功
   - 每个云函数旁边应该显示绿色的 "已部署" 状态

## 🧪 测试云函数

在前端测试页面中验证：
- `/pages/test/supabaseQuickTest.vue` - 零依赖快速测试
- `/pages/test/supabaseDemo.vue` - 完整演示页面

## ⚠️ 常见问题解决

### 1. 看不到 cloudfunctions 文件夹
- 确保运行了 `npm run copy-cloudfunctions`
- 检查微信开发者工具的项目路径是否正确
- 刷新项目文件列表

### 2. 云函数部署失败
- 检查网络连接
- 确认云开发环境已经开通
- 查看控制台错误信息

### 3. 云函数调用失败
- 检查云函数名称是否正确
- 确认参数格式是否符合要求
- 查看云函数日志

## 📋 下一步计划

1. **测试前后端连通性**
   - 在测试页面中验证云函数调用
   - 确认 Supabase 连接正常

2. **完善错误处理**
   - 添加更详细的错误日志
   - 优化用户体验

3. **性能优化**
   - 优化云函数响应速度
   - 添加缓存机制

## 🎉 恭喜！

你的云函数复制和部署环境已经完全配置好了！现在可以：
- 使用 `npm run copy-cloudfunctions` 轻松复制云函数
- 在微信开发者工具中一键部署
- 在测试页面中验证功能

接下来就可以开始测试前后端的连通性了！
