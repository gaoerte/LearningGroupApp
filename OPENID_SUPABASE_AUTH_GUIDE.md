# OpenID + Supabase 用户认证完整方案

## 概述

通过openid实现微信小程序用户与Supabase数据库的自动同步和认证，确保所有用户都能正确存在于数据库中。

## 架构设计

### 1. 认证流程
```
微信登录 → 获取openid → 检查Supabase → 自动创建用户 → 页面功能可用
```

### 2. 核心组件

#### A. AuthManager (`utils/authManager.js`)
- 统一的用户认证管理器
- 自动检查用户是否存在于Supabase
- 自动同步用户信息到Supabase
- 提供页面级认证初始化

#### B. 内联认证函数（每个页面）
- 避免模块导入兼容性问题
- 与AuthManager功能一致
- 确保在微信小程序环境下正常工作

#### C. 云函数API
- `createUser`: 创建或更新用户（upsert）
- `getUserInfo`: 检查用户是否存在
- 自动处理用户不存在的情况

## 使用方法

### 1. 页面集成（推荐方式）

在每个需要用户认证的页面的 `onLoad` 方法中：

```javascript
async onLoad() {
  await this.initPageWithAuth()
},

methods: {
  // 集成认证管理器的页面初始化方法
  async initPageWithAuth() {
    try {
      console.log('[页面] 开始页面认证初始化')
      
      // 1. 内联定义认证管理器（避免模块导入问题）
      const authManager = this.getAuthManager()
      
      // 2. 进行页面认证初始化（自动同步用户到Supabase）
      const userInfo = await authManager.initPageAuth({
        requireAuth: true,  // 是否必须登录
        autoSync: true,     // 自动同步到Supabase
      })
      
      if (userInfo) {
        this.currentUser = userInfo
        console.log('[页面] 用户认证完成，已同步到Supabase:', userInfo)
        
        // 初始化页面API
        const api = getAPIInstance();
        if (api) {
          api.currentUser = this.currentUser;
        }
        
        // 加载页面数据
        await this.loadPageData()
      } else {
        // 处理认证失败
        this.handleAuthFailure()
      }
      
    } catch (error) {
      console.error('[页面] 页面认证初始化失败:', error)
      this.handleAuthError(error)
    }
  },
  
  // 内联认证管理器
  getAuthManager() {
    return {
      // ... 认证管理器代码 ...
    }
  }
}
```

### 2. 关键特性

#### A. 自动用户同步
```javascript
// 在页面初始化时自动执行：
// 1. 检查本地登录状态
// 2. 检查用户是否存在于Supabase
// 3. 如果不存在，自动创建
// 4. 更新本地用户信息
const syncedUser = await authManager.ensureUserSynced()
```

#### B. 防并发同步
```javascript
// AuthManager 内置防并发机制
if (this.syncPromise) {
  console.log('等待现有同步完成...')
  return await this.syncPromise
}
```

#### C. 错误容错
```javascript
// 同步失败时不影响页面功能
try {
  const syncedUser = await this.ensureUserSynced()
  return syncedUser
} catch (syncError) {
  console.warn('用户同步失败，但继续页面加载:', syncError.message)
  return userInfo // 返回本地用户信息
}
```

## 云函数API设计

### 1. 创建用户（createUser）
```javascript
// 支持 upsert 操作：存在则更新，不存在则创建
{
  action: 'createUser',
  openid: 'user_openid',
  nickname: '用户昵称',
  avatarUrl: '头像URL',
  bio: '用户简介'
}
```

### 2. 获取用户信息（getUserInfo）
```javascript
{
  action: 'getUserInfo',
  openid: 'user_openid'  // 或 userId: 'user_id'
}
```

### 3. 错误处理
```javascript
// 云函数自动处理用户不存在情况
if (createUserError && createUserError.code !== '23505') { // 23505是重复键错误
  throw new Error(`创建用户失败: ${createUserError.message}`)
}
```

## 数据库设计

### 用户表结构（users）
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  openid TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### RLS 策略
```sql
-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有用户信息（用于显示群组成员等）
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

-- 用户只能更新自己的信息
CREATE POLICY "Users can update own info" ON users FOR UPDATE USING (auth.uid()::text = openid);

-- 允许创建新用户
CREATE POLICY "Allow user creation" ON users FOR INSERT WITH CHECK (true);
```

## 登录流程增强

### 1. 微信登录时自动同步
```javascript
// 在 UserAPI.wechatLogin 中
static async wechatLogin(code) {
  // 1. 获取微信用户信息
  const userInfo = await getWechatUserInfo(code)
  
  // 2. 同时在Supabase中创建用户
  try {
    const supabaseResult = await this.createSupabaseUser(userInfo)
    Object.assign(userInfo, supabaseResult)
  } catch (supabaseError) {
    console.warn('Supabase用户创建失败，但继续登录流程:', supabaseError.message)
  }
  
  // 3. 返回登录结果
  return { success: true, data: { userInfo, token } }
}
```

### 2. 存储键名统一
```javascript
// 所有页面使用相同的存储键名
const token = uni.getStorageSync('user_token')
const userInfo = uni.getStorageSync('user_info')
const isLoggedIn = uni.getStorageSync('is_logged_in')
```

## 测试和调试

### 1. 用户同步测试脚本
```javascript
// test-user-sync.js
const testUserSync = async () => {
  const authManager = require('./utils/authManager.js')
  
  // 测试用户同步
  try {
    const result = await authManager.ensureUserSynced()
    console.log('✅ 用户同步测试成功:', result)
  } catch (error) {
    console.error('❌ 用户同步测试失败:', error)
  }
}
```

### 2. 调试信息
```javascript
// 在控制台查看详细日志
console.log('[AuthManager] 检查用户是否存在于Supabase:', openid)
console.log('[AuthManager] 用户同步成功:', syncResult)
console.log('[AuthManager] 页面认证初始化完成，用户已同步')
```

## 部署和监控

### 1. 云函数部署
```bash
# 确保云函数已更新
# 检查 Supabase 连接配置
# 验证数据库表结构
```

### 2. 监控指标
- 用户同步成功率
- 页面认证失败次数
- 云函数调用响应时间
- 数据库连接状态

## 常见问题解决

### 1. 用户不存在错误
```
解决方案：页面 onLoad 时调用 initPageWithAuth()
原因：用户未同步到Supabase
```

### 2. 登录状态丢失
```
解决方案：统一使用 user_token, user_info, is_logged_in 键名
原因：存储键名不一致
```

### 3. API实例undefined
```
解决方案：使用内联API定义，避免模块导入
原因：微信小程序模块导入兼容性问题
```

### 4. 并发同步问题
```
解决方案：AuthManager内置防并发机制
原因：多个页面同时进行用户同步
```

## 最佳实践

1. **所有页面都使用 `initPageWithAuth()`**
2. **统一存储键名：`user_token`, `user_info`, `is_logged_in`**
3. **使用内联API定义避免导入问题**
4. **错误容错：同步失败不影响页面功能**
5. **详细日志：便于调试和监控**
6. **定期测试用户同步功能**

## 总结

通过这套方案，实现了：
- ✅ openid与Supabase的自动映射
- ✅ 用户信息的自动同步
- ✅ 微信小程序环境兼容性
- ✅ 错误容错和调试支持
- ✅ 统一的认证状态管理

所有用户都能通过openid在Supabase中正确存在，确保群组创建、加入等功能正常运行。
