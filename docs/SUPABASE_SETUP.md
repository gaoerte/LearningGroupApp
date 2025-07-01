# Supabase 配置指南

## 📋 项目后端架构

### 架构设计
```
微信小程序前端 → 云函数代理层 → Supabase 数据库
```

### 优势
- ✅ 绕过小程序环境限制
- ✅ 统一错误处理和日志
- ✅ 安全的 API 密钥管理
- ✅ 灵活的业务逻辑处理

## 🚀 部署步骤

### 1. 设置 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 记录项目 URL 和 Service Role Key

### 2. 执行数据库初始化

在 Supabase 控制台的 SQL Editor 中执行 `database/schema.sql` 中的建表语句：

```sql
-- 复制 database/schema.sql 中的所有内容并执行
```

### 3. 配置云函数

1. **更新 userData 云函数中的 Supabase 配置**：
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://your-project-id.supabase.co',
     serviceKey: 'your-service-role-key'
   };
   ```

2. **部署云函数**：
   - 在微信开发者工具中右键 `cloudfunctions` 目录
   - 选择"上传并部署（云端安装依赖）"
   - 等待部署完成

### 4. 测试连接

1. **登录测试**：
   - 使用 `wechatLogin` 云函数测试用户认证
   
2. **数据操作测试**：
   - 调用 `userData` 云函数测试数据库连接

## 📚 API 使用示例

### 前端调用示例

```javascript
import { userAPI, checkinAPI, studyGroupAPI, supabaseHelper } from '@/api/supabase.js';

// 用户登录后初始化
async function handleLogin(userInfo) {
  try {
    const result = await supabaseHelper.initializeUser(userInfo);
    console.log('用户初始化成功:', result);
  } catch (error) {
    console.error('用户初始化失败:', error);
  }
}

// 打卡功能
async function checkin(content) {
  try {
    // 检查今日是否已打卡
    const hasCheckedIn = await supabaseHelper.checkTodayCheckin();
    if (hasCheckedIn) {
      uni.showToast({ title: '今日已打卡', icon: 'none' });
      return;
    }
    
    // 创建打卡记录
    const result = await checkinAPI.createRecord(content);
    if (result.success) {
      uni.showToast({ title: '打卡成功' });
    }
  } catch (error) {
    console.error('打卡失败:', error);
  }
}

// 获取学习群组
async function loadStudyGroups() {
  try {
    const result = await studyGroupAPI.getGroups({ limit: 20 });
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('获取群组失败:', error);
    return [];
  }
}
```

## 🔧 故障排除

### 常见问题

1. **云函数部署失败**
   - 检查依赖包是否正确安装
   - 确认云开发环境已开通

2. **Supabase 连接失败**
   - 检查 URL 和 Key 是否正确
   - 确认云函数有网络访问权限

3. **数据操作失败**
   - 检查表结构是否正确创建
   - 确认 RLS 策略是否正确配置

### 调试技巧

1. **查看云函数日志**：
   - 在微信开发者工具 → 云开发 → 云函数 → 日志
   
2. **检查 Supabase 日志**：
   - 在 Supabase 控制台 → Logs 部分

## 📈 扩展功能

### 可以添加的功能模块

1. **实时聊天**：利用 Supabase Realtime
2. **文件上传**：利用 Supabase Storage
3. **推送通知**：结合微信小程序模板消息
4. **数据分析**：利用 Supabase Dashboard

### 性能优化

1. **数据缓存**：在云函数中添加 Redis 缓存
2. **分页查询**：大数据量时使用分页
3. **索引优化**：为常用查询字段添加索引

## 🔒 安全考虑

1. **RLS 策略**：确保数据访问安全
2. **输入验证**：在云函数中验证用户输入
3. **API 限流**：防止恶意请求
4. **密钥管理**：Service Role Key 仅在云函数中使用
