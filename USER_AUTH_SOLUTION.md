# 用户认证状态管理解决方案

## 问题描述

在微信小程序环境下，由于模块导入兼容性问题，我们采用了内联API的方案。但这导致了一个新问题：每个页面的API实例都是独立的，用户登录状态无法在API实例间共享，造成"首页已登录但其他页面判定未登录"的问题。

## 解决方案

### 1. 统一的用户状态存储

使用 `uni.getStorageSync()` 和 `uni.setStorageSync()` 来持久化存储用户信息：

- `token`: 用户认证令牌
- `userInfo`: 用户详细信息

### 2. 内联认证工具函数

为了避免模块导入问题，在每个需要用户认证的页面中内联定义认证工具函数：

```javascript
// 检查登录状态
function isLoggedIn() {
  try {
    const token = uni.getStorageSync('token');
    const userInfo = uni.getStorageSync('userInfo');
    return !!(token && userInfo);
  } catch (error) {
    return false;
  }
}

// 获取当前用户
function getCurrentUser() {
  try {
    return uni.getStorageSync('userInfo') || null;
  } catch (error) {
    return null;
  }
}

// 要求登录
function requireLogin(message = '请先登录') {
  uni.showToast({ title: message, icon: 'none' });
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/login' });
  }, 1500);
}
```

### 3. 页面初始化标准流程

每个页面都遵循以下初始化流程：

```javascript
async initPage() {
  try {
    // 1. 检查登录状态
    if (!isLoggedIn()) {
      requireLogin();
      return;
    }
    
    // 2. 获取用户信息
    const userInfo = getCurrentUser();
    if (!userInfo) {
      requireLogin('用户信息获取失败，请重新登录');
      return;
    }
    
    // 3. 设置页面用户信息
    this.currentUser = userInfo;
    
    // 4. 初始化API实例用户信息
    const api = getAPIInstance();
    if (api) {
      api.currentUser = userInfo;
    }
    
    // 5. 执行页面特定的初始化逻辑
    await this.loadPageData();
    
  } catch (error) {
    console.error('页面初始化失败:', error);
    uni.showToast({ title: '初始化失败', icon: 'none' });
  }
}
```

### 4. API调用前的用户验证

在每个API调用方法中，都会再次确保用户信息可用：

```javascript
async someAPICall() {
  // 确保用户信息可用
  if (!this.currentUser) {
    const userInfo = getCurrentUser();
    if (!userInfo) {
      throw new Error('用户未登录，请重新登录');
    }
    this.currentUser = userInfo;
  }
  
  // 确保API实例有用户信息
  const api = getAPIInstance();
  api.currentUser = this.currentUser;
  
  // 执行API调用
  return await api.someMethod();
}
```

## 已修复的页面

### 1. 创建群组页面 (`pages/createGroup/createGroup.vue`)
- ✅ 使用内联认证工具函数
- ✅ 标准化页面初始化流程
- ✅ API调用前验证用户状态

### 2. 学习群组页面 (`pages/studyGroups/studyGroups.vue`)
- ✅ 使用内联认证工具函数
- ✅ 标准化页面初始化流程
- ✅ 统计数据加载前验证用户状态

### 3. 推荐群组页面 (`pages/groupMatch/groupMatch.vue`)
- ✅ 使用内联认证工具函数
- ✅ 标准化页面初始化流程
- ✅ 加入群组前验证用户状态

## 用户状态同步机制

### 登录时的状态设置

在登录页面成功登录后：

```javascript
// 保存用户信息和token
uni.setStorageSync('userInfo', userInfo);
uni.setStorageSync('token', token);

// 跳转到主页
uni.reLaunch({ url: '/pages/index/index' });
```

### 登出时的状态清理

```javascript
// 清除用户信息
uni.removeStorageSync('userInfo');
uni.removeStorageSync('token');

// 跳转到登录页
uni.reLaunch({ url: '/pages/login/login' });
```

## 调试和测试

### 查看当前登录状态

在控制台执行：

```javascript
console.log('Token:', uni.getStorageSync('token'));
console.log('UserInfo:', uni.getStorageSync('userInfo'));
```

### 模拟登录状态

```javascript
// 设置模拟用户信息
const mockUser = {
  id: 'mock_user_' + Date.now(),
  openid: 'user_wx_test',
  nickname: '测试用户',
  avatarUrl: '/static/default-avatar.png'
};
uni.setStorageSync('userInfo', mockUser);
uni.setStorageSync('token', 'mock_token');
```

## 注意事项

1. **一致性**: 所有页面都必须使用相同的认证检查逻辑
2. **容错性**: 在API调用失败时提供友好的错误提示
3. **安全性**: token过期或无效时及时清除并要求重新登录
4. **用户体验**: 避免频繁的登录跳转，在必要时才进行跳转

## 后续优化

1. 考虑添加token过期检查机制
2. 实现自动刷新token功能
3. 添加网络状态检查和离线模式支持
4. 优化登录跳转的用户体验
