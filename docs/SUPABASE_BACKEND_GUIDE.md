# Supabase + 微信云函数后端实现指南

## 🏗️ 架构设计

### 系统架构图
```
微信小程序前端
       ↓
   微信云函数代理层
       ↓
   Supabase 数据库
```

### 架构优势
- ✅ **绕过小程序网络限制** - 通过云函数作为代理访问外部 API
- ✅ **安全性保障** - API 密钥在云端，不暴露给前端
- ✅ **统一错误处理** - 云函数层统一处理异常和日志
- ✅ **开发效率高** - Supabase 提供开箱即用的功能
- ✅ **实时数据同步** - 支持实时订阅和推送
- ✅ **扩展性强** - 模块化设计，便于功能扩展

## 🚀 部署步骤

### 第一步：配置 Supabase

1. **创建 Supabase 项目**
   - 访问 [https://supabase.com/](https://supabase.com/)
   - 注册账号并创建新项目
   - 记录项目 URL 和 Service Role Key

2. **执行数据库初始化**
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- 复制 database/schema_v2_optimized.sql 中的所有内容
   ```

3. **配置 RLS 安全策略**
   ```sql
   -- 在 Supabase 中启用行级安全
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;
   ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
   ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
   
   -- 创建基础安全策略（示例）
   CREATE POLICY "用户只能访问自己的数据" ON users
     FOR ALL USING (auth.uid()::text = openid);
   ```

### 第二步：部署云函数

1. **创建云函数目录**
   ```bash
   mkdir cloudfunctions/supabaseProxy
   ```

2. **配置云函数**
   ```javascript
   // cloudfunctions/supabaseProxy/index.js
   const SUPABASE_CONFIG = {
     url: 'https://your-project-id.supabase.co',
     serviceKey: 'your-service-role-key'
   };
   ```

3. **部署云函数**
   - 在微信开发者工具中
   - 右键 `cloudfunctions/supabaseProxy` 目录
   - 选择"上传并部署（云端安装依赖）"

### 第三步：配置前端 API

1. **更新 API 引用**
   ```javascript
   // 将原有的 API 调用改为新版本
   import { userAPI, checkinAPI, studyGroupAPI } from '@/api/supabase-v2.js';
   ```

2. **测试连接**
   ```javascript
   // 在某个页面中测试连接
   async testConnection() {
     const result = await supabaseUtils.healthCheck();
     console.log('连接测试:', result);
   }
   ```

## 📚 API 使用示例

### 用户管理

```javascript
// 用户登录初始化
async handleLogin(userInfo) {
  try {
    const result = await userAPI.initializeUser(userInfo);
    if (result.success) {
      if (result.isNewUser) {
        console.log('欢迎新用户!');
      } else {
        console.log('欢迎回来!');
      }
      // 保存用户信息到本地
      wx.setStorageSync('userInfo', result.data);
    }
  } catch (error) {
    console.error('登录失败:', error);
  }
}

// 更新用户资料
async updateProfile(profileData) {
  try {
    const result = await userAPI.updateProfile(profileData);
    if (result.success) {
      wx.showToast({ title: '更新成功' });
    }
  } catch (error) {
    wx.showToast({ title: '更新失败', icon: 'error' });
  }
}
```

### 打卡功能

```javascript
// 创建打卡记录
async createCheckin(content, studyTime) {
  try {
    // 先验证数据
    const validation = supabaseUtils.validators.checkinContent(content);
    if (!validation.valid) {
      wx.showToast({ title: validation.message, icon: 'none' });
      return;
    }
    
    const result = await checkinAPI.createRecord({
      content: content,
      study_minutes: parseInt(studyTime),
      mood: this.data.selectedMood,
      category: this.data.selectedCategory
    });
    
    if (result.success) {
      wx.showToast({ title: '打卡成功!' });
      this.loadCheckinRecords(); // 刷新列表
    } else {
      wx.showToast({ title: result.error, icon: 'error' });
    }
  } catch (error) {
    console.error('打卡失败:', error);
  }
}

// 获取打卡记录
async loadCheckinRecords() {
  try {
    wx.showLoading({ title: '加载中...' });
    
    const result = await checkinAPI.getRecords({
      limit: 20,
      offset: this.data.checkinList.length
    });
    
    if (result.success) {
      const formattedData = result.data.map(item => ({
        ...item,
        timeDisplay: supabaseUtils.formatRelativeTime(item.created_at),
        userNickname: item.users?.nickname || '用户'
      }));
      
      this.setData({
        checkinList: [...this.data.checkinList, ...formattedData]
      });
    }
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    wx.hideLoading();
  }
}
```

### 群组管理

```javascript
// 创建学习群组
async createStudyGroup(groupData) {
  try {
    // 验证群组名称
    const validation = supabaseUtils.validators.groupName(groupData.name);
    if (!validation.valid) {
      wx.showToast({ title: validation.message, icon: 'none' });
      return;
    }
    
    const result = await studyGroupAPI.createGroup({
      name: groupData.name,
      description: groupData.description,
      category: groupData.category,
      max_members: groupData.maxMembers,
      study_goal: groupData.studyGoal,
      difficulty_level: groupData.difficultyLevel
    });
    
    if (result.success) {
      wx.showToast({ title: '群组创建成功!' });
      // 跳转到群组页面
      wx.navigateTo({
        url: `/pages/groupInfo/groupInfo?id=${result.data[0].id}`
      });
    }
  } catch (error) {
    console.error('创建群组失败:', error);
  }
}

// 加入群组
async joinGroup(groupId) {
  try {
    const result = await studyGroupAPI.joinGroup(groupId, '希望一起学习进步！');
    
    if (result.success) {
      wx.showToast({ title: '加入成功!' });
      this.loadMyGroups(); // 刷新我的群组列表
    } else {
      wx.showToast({ title: result.error, icon: 'error' });
    }
  } catch (error) {
    console.error('加入群组失败:', error);
  }
}
```

## 🔧 高级功能

### 数据缓存策略

```javascript
// 使用缓存提升用户体验
async getCheckinRecordsWithCache() {
  const cacheKey = 'checkin_records_page_1';
  
  // 先从缓存获取
  let cachedData = cacheManager.get(cacheKey);
  if (cachedData) {
    this.setData({ checkinList: cachedData });
  }
  
  // 从服务器获取最新数据
  const result = await checkinAPI.getRecords({ limit: 20 });
  if (result.success) {
    this.setData({ checkinList: result.data });
    // 缓存数据（5分钟有效期）
    cacheManager.set(cacheKey, result.data, 300);
  }
}
```

### 错误处理和重试

```javascript
// 带重试的 API 调用
async apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apiCall();
      if (result.success) {
        return result;
      }
      throw new Error(result.error);
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 实时数据订阅 (高级功能)

```javascript
// TODO: 实现 Supabase Realtime 订阅
// 用于群聊消息、打卡动态等实时功能
```

## 🔒 安全考虑

### 1. 数据访问控制
- 使用 Supabase RLS (Row Level Security) 策略
- 云函数中验证用户身份
- 敏感操作需要额外权限检查

### 2. 输入验证
- 前端验证用户输入格式
- 云函数中再次验证数据有效性
- 防止 SQL 注入和 XSS 攻击

### 3. API 密钥管理
- Service Role Key 仅在云函数中使用
- 定期轮换 API 密钥
- 监控 API 调用量和异常

## 📊 性能优化

### 1. 数据库优化
- 为常用查询字段添加索引
- 使用数据库触发器自动更新统计
- 定期清理过期数据

### 2. 缓存策略
- 静态数据使用本地缓存
- 动态数据使用短期缓存
- 关键操作清除相关缓存

### 3. 网络优化
- 批量操作减少请求次数
- 分页加载大量数据
- 压缩传输数据

## 🔧 故障排除

### 常见问题

1. **云函数调用失败**
   - 检查云函数是否正确部署
   - 验证 Supabase 配置是否正确
   - 查看云函数执行日志

2. **数据库连接问题**
   - 确认 Supabase URL 和 Key 正确
   - 检查网络连接状态
   - 验证数据库表是否存在

3. **权限错误**
   - 检查 RLS 策略配置
   - 验证用户身份认证
   - 确认 API 权限设置

### 调试技巧

1. **开启详细日志**
   ```javascript
   // 在云函数中添加调试日志
   console.log('API 调用:', action, data);
   console.log('Supabase 响应:', result);
   ```

2. **使用健康检查**
   ```javascript
   // 定期检查系统状态
   const health = await supabaseUtils.healthCheck();
   console.log('系统状态:', health);
   ```

## 🚀 部署清单

- [ ] Supabase 项目创建完成
- [ ] 数据库表结构初始化
- [ ] RLS 安全策略配置
- [ ] 云函数部署成功
- [ ] API 连接测试通过
- [ ] 前端集成完成
- [ ] 功能测试验证
- [ ] 性能优化配置
- [ ] 监控告警设置

**恭喜！您的 Supabase 后端系统已经可以投入使用了！** 🎉
