# 用户登录系统 - 完整设计方案

## 🎯 登录系统架构设计

### 📋 运行逻辑流程

```
用户点击登录
    ↓
获取微信授权码
    ↓
调用云函数验证
    ↓
获取用户openid
    ↓
检查用户是否存在
    ↓
【不存在】→ 创建新用户 → 【存在】→ 更新用户信息
    ↓
保存登录状态
    ↓
跳转到首页
```

### 🔧 技术实现方案

#### 1. 前端登录流程
```javascript
// pages/login/login.vue
1. 用户点击"微信登录"按钮
2. 调用 uni.login() 获取临时授权码
3. 调用 UserAPI.wechatLogin(code) 
4. 处理登录结果，保存用户信息
5. 跳转到首页
```

#### 2. API层处理
```javascript
// api/userAPI.js
1. UserAPI.wechatLogin(code) 
2. 调用 supabaseCore 云函数
3. action: 'wechatLogin'
4. 返回用户信息和openid
```

#### 3. 云函数处理
```javascript
// cloudfunctions/supabaseCore/index.js
1. 接收action: 'wechatLogin'
2. 调用微信API验证code
3. 获取openid和用户信息
4. 查询或创建用户记录
5. 返回完整用户信息
```

#### 4. 数据库操作
```sql
-- 用户表查询/创建
1. 根据openid查询用户
2. 如果不存在，创建新用户记录
3. 更新用户最后登录时间
4. 返回用户完整信息
```

### 📁 涉及的文件

1. **pages/login/login.vue** - 登录页面UI和逻辑
2. **api/userAPI.js** - 用户API封装
3. **cloudfunctions/supabaseCore/index.js** - 云函数处理
4. **utils/storage.js** - 本地存储管理
5. **store/modules/user.js** - 用户状态管理

### 🎯 实现步骤

#### Step 1: 完善UserAPI
- 添加wechatLogin方法
- 添加getUserProfile方法
- 添加updateUserInfo方法

#### Step 2: 云函数扩展
- 添加wechatLogin action
- 集成微信API调用
- 实现用户数据库操作

#### Step 3: 前端逻辑优化
- 重构登录页面逻辑
- 添加用户状态管理
- 实现登录状态持久化

#### Step 4: 错误处理
- 网络错误处理
- 授权失败处理
- 用户信息不完整处理

### 🔐 安全考虑

1. **Token管理**：使用JWT或自定义token
2. **会话有效期**：设置合理的过期时间
3. **用户信息加密**：敏感信息本地加密存储
4. **权限控制**：不同用户类型的权限管理

### 📊 用户数据结构

```javascript
// 完整用户信息对象
{
  id: "uuid",
  openid: "wx_openid_123",
  nickname: "用户昵称",
  avatar_url: "头像链接",
  email: "可选邮箱",
  phone: "可选手机号",
  total_checkin_days: 0,
  continuous_checkin_days: 0,
  last_checkin_date: null,
  last_login_time: "2025-07-03T14:30:00Z",
  status: "active",
  created_at: "2025-07-03T14:30:00Z",
  updated_at: "2025-07-03T14:30:00Z"
}
```

### 🚀 本地存储策略

```javascript
// 登录成功后保存的信息
uni.setStorageSync('user_token', token);
uni.setStorageSync('user_openid', openid);
uni.setStorageSync('user_info', userInfo);
uni.setStorageSync('login_time', timestamp);
```

### 🔄 登录状态检查

```javascript
// 应用启动时检查登录状态
1. 读取本地token
2. 验证token有效性
3. 如果无效，清除本地数据，跳转登录页
4. 如果有效，更新用户信息，进入主页
```

---

## 🎯 下一步实现计划

1. **今天**：完善UserAPI和云函数wechatLogin
2. **明天**：重构登录页面逻辑
3. **后天**：添加用户状态管理和持久化
4. **完成**：测试所有登录场景和错误处理
