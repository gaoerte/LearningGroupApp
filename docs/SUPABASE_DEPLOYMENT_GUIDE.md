# 🚀 Supabase 配置完成 - 部署指南

## ✅ 配置信息确认

您的 Supabase 项目已配置完成：

- **项目URL**: https://klpseujbhwvifsfshfdx.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ0MDg1NSwiZXhwIjoyMDY3MDE2ODU1fQ.-KRD7JaC50uWfTQPdnGI5ZYDZttTZcl-uKuIl6Y0jGc

## 🗄️ 第一步：在 Supabase 中创建数据库表

1. **访问 Supabase Dashboard**
   - 打开 https://klpseujbhwvifsfshfdx.supabase.co
   - 使用您的账号登录

2. **进入 SQL Editor**
   - 在左侧导航栏点击 "SQL Editor"
   - 点击 "New query"

3. **执行数据库脚本**
   - 复制 `database/schema_optimized.sql` 中的全部内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 按钮执行

4. **验证表创建**
   - 执行完成后，点击左侧的 "Table Editor"
   - 应该能看到以下表：
     - users (用户表)
     - user_settings (用户设置)
     - study_groups (学习群组)
     - group_members (群组成员)
     - checkin_records (打卡记录)
     - chat_sessions (聊天会话)
     - chat_messages (聊天消息)
     - notifications (通知)
     - system_configs (系统配置)

## ☁️ 第二步：部署云函数

1. **检查云函数配置**
   - 云函数路径: `cloudfunctions/supabaseProxy/index.js`
   - 已配置您的 Supabase URL 和 Service Role Key

2. **上传云函数**
   - 在微信开发者工具中打开项目
   - 右键点击 `cloudfunctions/supabaseProxy` 文件夹
   - 选择 "上传并部署: 云端安装依赖"
   - 等待部署完成

3. **测试云函数**
   - 部署完成后，可以在云函数日志中查看部署状态
   - 接下来将通过前端页面测试功能

## 🧪 第三步：测试连接

1. **基础连接测试**
   - 在小程序中访问页面: `/pages/test/supabaseTestBasic`
   - 配置信息已自动填入
   - 点击 "测试连接" 按钮
   - 应该显示 "连接成功" 状态

2. **数据库操作测试**
   - 测试用户创建和查询
   - 测试打卡记录创建
   - 测试群组操作

## 📱 第四步：集成到应用

现在您可以在应用中使用 Supabase 数据库：

### 用户登录集成
```javascript
import databaseAPI from '@/api/database.js'

// 在登录页面使用
async performLogin(type = 'wechat') {
  try {
    // 获取用户信息
    const userInfo = await this.getWechatUserInfo()
    
    // 创建或更新用户到 Supabase
    const userData = {
      openid: userInfo.openid,
      nickname: userInfo.nickname,
      avatar_url: userInfo.avatar_url
    }
    
    const user = await databaseAPI.createOrUpdateUser(userData)
    
    // 保存用户信息到本地
    uni.setStorageSync('user_info', user)
    uni.setStorageSync('user_id', user.id)
    
  } catch (error) {
    console.error('登录失败:', error)
  }
}
```

### 学习打卡集成
```javascript
// 在打卡页面使用
async submitCheckin() {
  try {
    const userId = uni.getStorageSync('user_id')
    
    // 检查今日是否已打卡
    const todayChecked = await databaseAPI.checkTodayCheckin(userId)
    if (todayChecked) {
      return uni.showToast({ title: '今日已打卡', icon: 'none' })
    }
    
    // 创建打卡记录
    const checkinData = {
      user_id: userId,
      content: this.checkinContent,
      study_duration: this.studyMinutes,
      mood: this.selectedMood
    }
    
    await databaseAPI.createCheckin(checkinData)
    
    // 更新用户统计
    await databaseAPI.updateUserStats(userId, {
      total_study_days: 1,
      continuous_study_days: 1,
      total_study_minutes: this.studyMinutes
    })
    
    uni.showToast({ title: '打卡成功！', icon: 'success' })
    
  } catch (error) {
    console.error('打卡失败:', error)
  }
}
```

### 群组功能集成
```javascript
// 获取和加入群组
async loadStudyGroups() {
  try {
    // 获取公开群组
    const publicGroups = await databaseAPI.getPublicGroups({
      category: this.selectedCategory,
      limit: 20
    })
    
    // 获取用户已加入的群组
    const userId = uni.getStorageSync('user_id')
    const userGroups = await databaseAPI.getUserGroups(userId)
    
    this.groups = publicGroups
    this.myGroups = userGroups
    
  } catch (error) {
    console.error('加载群组失败:', error)
  }
}
```

## 🔍 第五步：调试和排错

### 查看云函数日志
1. 在微信开发者工具中打开 "云开发控制台"
2. 进入 "云函数" → "日志"
3. 查看 supabaseProxy 函数的执行日志

### 常见问题解决

1. **连接超时**
   - 检查网络连接
   - 确认 Supabase URL 正确
   - 检查 API Key 是否有效

2. **权限错误**
   - 确认 Service Role Key 正确
   - 检查 RLS 策略是否正确配置
   - 验证表权限设置

3. **数据操作失败**
   - 检查表结构是否正确创建
   - 验证数据格式是否符合要求
   - 查看详细错误信息

## 🎯 第六步：生产环境优化

### 安全配置
1. **环境变量管理**
   - 将敏感信息移至云函数环境变量
   - 定期轮换 API Keys
   - 启用 IP 白名单（如需要）

2. **RLS 策略优化**
   - 检查所有表的 RLS 策略
   - 确保用户只能访问自己的数据
   - 定期审核权限配置

### 性能优化
1. **数据库索引**
   - 已在 schema 中创建了必要索引
   - 根据查询模式添加复合索引
   - 监控慢查询并优化

2. **缓存策略**
   - 在前端实现数据缓存
   - 使用本地存储减少网络请求
   - 实现增量数据同步

## ✅ 验证清单

完成以下验证后，您的 Supabase 集成就完全就绪：

- [ ] Supabase 数据库表创建成功
- [ ] 云函数部署完成
- [ ] 基础连接测试通过
- [ ] 用户注册登录功能正常
- [ ] 学习打卡功能正常
- [ ] 群组操作功能正常
- [ ] 数据查询和统计正常
- [ ] 错误处理机制完善
- [ ] 生产环境安全配置完成

## 🚀 下一步

现在您可以：
1. 开始开发具体的业务功能
2. 完善用户界面和体验
3. 添加更多高级功能
4. 准备发布和部署

如有任何问题，请查看云函数日志或联系技术支持！
