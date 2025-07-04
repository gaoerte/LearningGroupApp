# 🚀 Supabase 连接设置指南

## 今晚的连接计划

### 第一步：验证当前配置 ⚡ (5分钟)

运行快速诊断，检查基础配置：

```javascript
// 在任意页面的控制台运行
import { supabaseSetupHelper } from '@/utils/supabase-setup-helper.js';

// 快速诊断
const diagnosis = await supabaseSetupHelper.quickDiagnosis();
console.log('诊断结果:', diagnosis);
```

### 第二步：部署测试云函数 🔧 (10分钟)

1. **上传云函数**：
   - 将 `cloudfunctions/supabaseTest` 上传到 uniCloud
   - 安装依赖：`@supabase/supabase-js`

2. **测试云函数**：
```javascript
// 测试云函数连接
uni.cloud.callFunction({
  name: 'supabaseTest',
  data: { action: 'ping' },
  success: (res) => {
    console.log('云函数测试结果:', res.result);
  }
});
```

### 第三步：创建数据库表 🗄️ (15分钟)

在 Supabase Dashboard 执行以下 SQL：

```sql
-- 1. 创建用户表
CREATE TABLE users(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  openid varchar UNIQUE NOT NULL,
  nickname varchar(50),
  avatar_url text,
  bio text,
  level integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 2. 创建学习群组表  
CREATE TABLE study_groups(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  description text,
  creator_id uuid REFERENCES users(id),
  current_members integer DEFAULT 1,
  max_members integer DEFAULT 20,
  is_public boolean DEFAULT TRUE,
  invite_code varchar(10) UNIQUE,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 3. 创建群组成员表
CREATE TABLE group_members(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role varchar(20) DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- 4. 创建聊天消息表
CREATE TABLE chat_messages(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id),
  sender_name varchar(50),
  sender_avatar text,
  content text NOT NULL,
  type varchar(20) DEFAULT 'text',
  created_at timestamp with time zone DEFAULT NOW()
);
```

### 第四步：配置RLS安全策略 🔒 (10分钟)

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 用户表策略（用户可以查看和更新自己的信息）
CREATE POLICY "用户可以查看所有用户基本信息" ON users FOR SELECT USING (true);
CREATE POLICY "用户可以更新自己的信息" ON users FOR UPDATE USING (true);
CREATE POLICY "允许插入新用户" ON users FOR INSERT WITH CHECK (true);

-- 群组表策略（公开群组所有人可见）
CREATE POLICY "公开群组所有人可见" ON study_groups FOR SELECT USING (is_public = true);
CREATE POLICY "创建者可以更新群组" ON study_groups FOR UPDATE USING (true);
CREATE POLICY "允许创建新群组" ON study_groups FOR INSERT WITH CHECK (true);

-- 群组成员策略
CREATE POLICY "群组成员可见" ON group_members FOR SELECT USING (true);
CREATE POLICY "允许加入群组" ON group_members FOR INSERT WITH CHECK (true);

-- 消息表策略
CREATE POLICY "群组消息可见" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "允许发送消息" ON chat_messages FOR INSERT WITH CHECK (true);
```

### 第五步：运行完整测试 🧪 (10分钟)

```javascript
// 运行完整连接测试
const testResults = await supabaseSetupHelper.runFullConnectionTest();
console.log('完整测试结果:', testResults);

// 生成设置报告
const report = supabaseSetupHelper.generateSetupReport(testResults);
console.log('设置报告:', report);
```

### 第六步：启用真实API ⚡ (10分钟)

修改 `groupChat.vue` 启用真实API：

```javascript
// 在 setupRealtimeSubscription 方法中
setupRealtimeSubscription() {
  // 注释掉这行
  // console.log('[GroupChat] 实时订阅暂时禁用，使用轮询模式');
  // this.startMessagePolling();
  // return;
  
  // 启用真实的实时订阅代码
  if (!this.chatClient || !this.groupId) {
    console.warn('[GroupChat] 无法设置实时订阅：缺少客户端或群组ID');
    return;
  }
  // ... 其余实时订阅代码
}
```

## 🎯 今晚的里程碑

- [ ] ✅ 云函数部署成功
- [ ] ✅ 数据库连接测试通过  
- [ ] ✅ 表结构创建完成
- [ ] ✅ RLS策略配置完成
- [ ] ✅ 用户注册/登录流程测试
- [ ] ✅ 群组创建/加入功能测试
- [ ] ✅ 聊天消息发送/接收测试
- [ ] ✅ 实时功能基本可用

## 🔧 调试技巧

### 查看详细日志
```javascript
// 在浏览器控制台启用详细日志
localStorage.setItem('supabase_debug', 'true');
```

### 测试单个功能
```javascript
// 测试用户创建
uni.cloud.callFunction({
  name: 'supabaseTest',
  data: { 
    action: 'createUser',
    userData: { nickname: '我的昵称' }
  }
});

// 测试群组创建
uni.cloud.callFunction({
  name: 'supabaseTest', 
  data: {
    action: 'createGroup',
    groupData: { name: '我的测试群组' }
  }
});
```

### 常见问题解决

1. **云函数超时**：
   - 检查网络连接
   - 确认 Supabase 服务状态
   - 尝试增加超时时间

2. **数据库连接失败**：
   - 验证 URL 和 API Key
   - 检查 IP 白名单设置
   - 确认 RLS 策略正确

3. **权限错误**：
   - 检查 RLS 策略
   - 确认用户认证状态
   - 验证表权限设置

## 📞 需要帮助？

如果遇到任何问题，可以：

1. 检查浏览器控制台的错误日志
2. 运行诊断工具获取详细信息
3. 查看 Supabase Dashboard 的日志
4. 随时告诉我具体的错误信息！

让我们一起让你的学习小组App连接上真实的数据库吧！ 🚀
