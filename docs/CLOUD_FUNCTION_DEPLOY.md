# 🚀 云函数快速部署指南

## 📋 部署前检查清单

### 1. 云开发环境设置
```bash
# 确保已开通云开发服务
# 在微信开发者工具中：云开发 -> 开通云开发
```

### 2. 必要文件确认
- ✅ `cloudfunctions/testProxy/index.js` - 测试云函数
- ✅ `cloudfunctions/testProxy/package.json` - 依赖配置
- ✅ `cloudfunctions/supabaseProxy/index.js` - 主业务云函数
- ✅ `cloudfunctions/supabaseProxy/package.json` - 依赖配置

## 🔧 快速部署步骤

### 步骤1: 部署测试云函数
```bash
# 在微信开发者工具中
1. 右键点击 cloudfunctions/testProxy
2. 选择 "上传并部署: 云端安装依赖"
3. 等待部署完成
```

### 步骤2: 测试基础连接
```javascript
// 在小程序中调用
uni.cloud.callFunction({
  name: 'testProxy',
  data: { action: 'ping' }
}).then(res => {
  console.log('测试结果:', res.result);
});
```

### 步骤3: 配置Supabase环境变量
```bash
# 在云开发控制台设置环境变量：
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 步骤4: 部署主业务云函数
```bash
# 在微信开发者工具中
1. 右键点击 cloudfunctions/supabaseProxy
2. 选择 "上传并部署: 云端安装依赖"
3. 等待部署完成
```

## 🐛 常见问题解决

### 问题1: 云函数调用失败
```
解决方案:
1. 检查云开发环境是否已开通
2. 确认云函数名称正确
3. 查看云函数日志排查错误
```

### 问题2: 依赖安装失败
```
解决方案:
1. 检查 package.json 格式
2. 使用 "云端安装依赖" 而不是本地安装
3. 删除 node_modules 重新部署
```

### 问题3: Supabase连接失败
```
解决方案:
1. 确认环境变量设置正确
2. 检查Supabase项目状态
3. 验证API密钥权限
```

## 📝 部署验证清单

- [ ] testProxy 云函数部署成功
- [ ] testProxy ping 测试通过
- [ ] supabaseProxy 云函数部署成功
- [ ] 环境变量配置完成
- [ ] healthCheck 测试通过
- [ ] 小程序端调用正常

## 🔍 调试技巧

### 查看云函数日志
```bash
# 在微信开发者工具中
1. 打开云开发控制台
2. 进入云函数管理
3. 点击对应云函数查看日志
```

### 本地调试
```javascript
// 使用云函数调试工具
import { cloudDebugger } from './utils/cloudFunction-debug.js';

// 执行诊断
const diagnosis = await cloudDebugger.diagnose();
console.log('诊断结果:', diagnosis);
```

## 📞 技术支持

如果遇到问题，请：
1. 检查微信开发者工具控制台错误信息
2. 查看云函数执行日志
3. 使用内置的调试工具进行诊断

---

**提示**: 建议先部署 testProxy 进行基础测试，确认云函数环境正常后再部署 supabaseProxy。
