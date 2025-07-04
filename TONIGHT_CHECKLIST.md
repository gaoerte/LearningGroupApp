# 🌙 今晚Supabase连接清单

## ✅ 准备工作清单

### 1. 环境检查
- [ ] 确认有稳定的网络连接
- [ ] 浏览器开发者工具准备就绪
- [ ] Supabase账号和项目准备就绪
- [ ] HBuilderX开发环境正常

### 2. 项目文件检查
- [x] ✅ 云函数 `supabaseTest` 已创建
- [x] ✅ 连接助手 `supabase-setup-helper.js` 已创建
- [x] ✅ 真实API `realSupabaseChatAPI.js` 已准备
- [x] ✅ 聊天页面添加了连接测试按钮
- [ ] 数据库表结构 SQL 文件准备就绪

## 🚀 连接步骤

### 第一阶段：基础连接 (30分钟)

#### 1. 部署云函数 (10分钟)
```bash
# 在HBuilderX中
1. 右键 cloudfunctions/supabaseTest
2. 选择"上传并部署云函数"
3. 等待部署完成
4. 在云开发控制台安装依赖 @supabase/supabase-js
```

#### 2. 验证云函数 (5分钟)
```javascript
// 在浏览器控制台测试
uni.cloud.callFunction({
  name: 'supabaseTest',
  data: { action: 'ping' },
  success: (res) => console.log('云函数测试:', res.result)
});
```

#### 3. 运行连接诊断 (5分钟)
```javascript
// 在聊天页面点击 🔗 按钮
// 或在控制台运行
import { supabaseSetupHelper } from '@/utils/supabase-setup-helper.js';
const diagnosis = await supabaseSetupHelper.quickDiagnosis();
```

#### 4. 检查Supabase项目状态 (10分钟)
- [ ] 登录 https://supabase.com
- [ ] 确认项目状态为 Active
- [ ] 复制项目URL和API Key
- [ ] 检查项目配额使用情况

### 第二阶段：数据库设置 (45分钟)

#### 1. 创建数据库表 (20分钟)
在 Supabase Dashboard → SQL Editor 执行：
```sql
-- 创建用户表
CREATE TABLE users(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  openid varchar UNIQUE NOT NULL,
  nickname varchar(50),
  avatar_url text,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 创建学习群组表
CREATE TABLE study_groups(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  description text,
  creator_id uuid REFERENCES users(id),
  current_members integer DEFAULT 1,
  max_members integer DEFAULT 20,
  invite_code varchar(10) UNIQUE,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 创建群组成员表
CREATE TABLE group_members(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role varchar(20) DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- 创建聊天消息表
CREATE TABLE chat_messages(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id),
  sender_name varchar(50),
  sender_avatar text,
  content text NOT NULL,
  type varchar(20) DEFAULT 'text',
  is_recalled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW()
);
```

#### 2. 配置RLS安全策略 (15分钟)
```sql
-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 基本策略（允许所有操作，生产环境需要更严格）
CREATE POLICY "允许所有用户操作" ON users FOR ALL USING (true);
CREATE POLICY "允许所有群组操作" ON study_groups FOR ALL USING (true);
CREATE POLICY "允许所有成员操作" ON group_members FOR ALL USING (true);
CREATE POLICY "允许所有消息操作" ON chat_messages FOR ALL USING (true);
```

#### 3. 测试数据库连接 (10分钟)
```javascript
// 测试基础查询
uni.cloud.callFunction({
  name: 'supabaseTest',
  data: { action: 'dbQuery' },
  success: (res) => console.log('数据库测试:', res.result)
});

// 测试用户创建
uni.cloud.callFunction({
  name: 'supabaseTest',
  data: { 
    action: 'createUser',
    userData: { nickname: '测试用户' }
  },
  success: (res) => console.log('用户创建:', res.result)
});
```

### 第三阶段：功能集成 (30分钟)

#### 1. 运行完整连接测试 (10分钟)
```javascript
// 在聊天页面点击连接测试按钮
// 确保所有测试项目都通过
```

#### 2. 测试核心功能 (15分钟)
- [ ] 用户注册/登录
- [ ] 群组创建
- [ ] 消息发送
- [ ] 消息接收
- [ ] 在线状态

#### 3. 启用真实API (5分钟)
```javascript
// 在 groupChat.vue 中替换 ChatAPI 导入
// 从: import { ChatAPI } from '../../api/chatAPI.js'
// 到: import { ChatAPI } from '../../api/realSupabaseChatAPI.js'
```

## 🔍 调试检查点

### 每个阶段都要检查：
1. **控制台无错误**：确保没有红色错误信息
2. **网络请求成功**：查看Network面板确认请求状态
3. **数据格式正确**：验证返回的数据结构符合预期
4. **功能正常**：实际操作确认功能可用

### 常见问题快速解决：
- **云函数部署失败**：检查网络，重试部署
- **数据库连接失败**：确认URL和Key，检查项目状态
- **权限错误**：检查RLS策略，确认表权限
- **响应超时**：检查网络延迟，考虑增加超时时间

## 🎯 成功标志

当看到这些时，说明连接成功了：
- [ ] ✅ 云函数测试通过
- [ ] ✅ 数据库查询正常
- [ ] ✅ 用户创建成功
- [ ] ✅ 群组功能正常
- [ ] ✅ 消息收发正常
- [ ] ✅ 聊天界面显示真实数据

## 📱 最终验证

在手机端/小程序端测试：
1. 登录功能
2. 加入群组
3. 发送消息
4. 接收消息
5. 查看在线成员

## 🎉 连接成功后

1. **关闭模拟数据**：注释掉所有测试数据代码
2. **启用实时功能**：配置Supabase Realtime
3. **优化性能**：添加缓存和错误重试
4. **完善功能**：实现文件上传、消息撤回等

---

**预计总时间**：1.5-2小时
**建议休息**：每45分钟休息10分钟
**记录问题**：遇到问题立即记录，便于排查

让我们开始这个激动人心的连接之旅吧！ 🚀✨
