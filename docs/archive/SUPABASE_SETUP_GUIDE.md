# Supabase 配置详细指南

## 📋 完整配置流程

### 第一步：创建和配置 Supabase 项目

#### 1.1 创建项目
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 使用 GitHub 或 Email 注册/登录
3. 点击 "New Project"
4. 填写项目信息：
   - **Name**: `LearningGroupApp`
   - **Database Password**: 设置强密码（记住这个密码！）
   - **Region**: 选择 `Northeast Asia (Seoul)` 或最近的区域
5. 点击 "Create new project"

#### 1.2 等待项目初始化
- 项目创建需要 2-3 分钟
- 创建完成后会自动跳转到项目 Dashboard

### 第二步：设置数据库

#### 2.1 执行数据库脚本
1. 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 复制并粘贴以下完整的 SQL 脚本：

```sql
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  openid varchar UNIQUE NOT NULL,
  nickname varchar(50),
  avatar_url text,
  bio text,
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  total_study_days integer DEFAULT 0,
  continuous_study_days integer DEFAULT 0,
  total_study_minutes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 学习群组表
CREATE TABLE study_groups(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  description text,
  creator_id uuid REFERENCES users(id),
  category varchar(50) DEFAULT 'general',
  tags text[] DEFAULT '{}',
  current_members integer DEFAULT 1,
  max_members integer DEFAULT 20,
  is_public boolean DEFAULT TRUE,
  require_approval boolean DEFAULT FALSE,
  study_goal text,
  target_duration_days integer DEFAULT 30,
  difficulty_level varchar(20) DEFAULT 'beginner',
  invite_code varchar(10) UNIQUE,
  status varchar(20) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 群组成员表
CREATE TABLE group_members(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role varchar(20) DEFAULT 'member',
  status varchar(20) DEFAULT 'active',
  join_message text,
  joined_at timestamp with time zone DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- 打卡记录表
CREATE TABLE checkin_records(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  content text,
  checkin_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT NOW(),
  UNIQUE (user_id, checkin_date)
);

-- AI聊天记录表
CREATE TABLE chat_messages(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  message text NOT NULL,
  ai_response text,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 群组匹配请求表
CREATE TABLE match_requests(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  interests text[],
  study_goals text,
  status varchar DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- 创建索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_study_groups_creator_id ON study_groups(creator_id);
CREATE INDEX idx_study_groups_category ON study_groups(category);
CREATE INDEX idx_study_groups_is_public ON study_groups(is_public);
CREATE INDEX idx_study_groups_status ON study_groups(status);
CREATE INDEX idx_study_groups_invite_code ON study_groups(invite_code);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_status ON group_members(status);
CREATE INDEX idx_checkin_records_user_id ON checkin_records(user_id);
CREATE INDEX idx_checkin_records_checkin_date ON checkin_records(checkin_date);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_match_requests_user_id ON match_requests(user_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);

-- 创建测试用的 RLS 策略（允许所有操作）
CREATE POLICY "Allow all operations for testing" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON study_groups FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON group_members FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON checkin_records FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations for testing" ON match_requests FOR ALL USING (true);
```

4. 点击 "Run" 执行脚本

#### 2.2 验证表创建
1. 点击左侧菜单的 "Table Editor"
2. 确认看到以下表：
   - users
   - study_groups
   - group_members
   - checkin_records
   - chat_messages
   - match_requests

### 第三步：获取 API 密钥

#### 3.1 获取项目配置信息
1. 点击左侧菜单的 "Settings"
2. 点击 "API"
3. 记录以下重要信息：

**Project URL**:
```
https://your-project-id.supabase.co
```

**API Keys**:
- **anon public** (公开密钥): `eyJ...` (用于客户端)
- **service_role** (服务端密钥): `eyJ...` (用于服务端，保密！)

#### 3.2 安全注意事项
- **anon public** 密钥可以在前端代码中使用
- **service_role** 密钥只能在服务端使用，绝不能暴露给前端
- 记录密钥到安全的地方（如密码管理器）

### 第四步：配置云函数环境变量

#### 4.1 在微信开发者工具中设置
1. 打开微信开发者工具
2. 进入云开发控制台
3. 点击 "设置" → "环境变量"
4. 添加以下环境变量：

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

#### 4.2 或者在 HBuilderX 中设置
1. 打开项目根目录的 `manifest.json`
2. 找到微信小程序配置部分
3. 添加环境变量配置

### 第五步：部署云函数

#### 5.1 部署测试云函数
1. 在 HBuilderX 中右键点击 `cloudfunctions` 文件夹
2. 选择 "上传部署"
3. 选择要部署的云函数：
   - `supabaseTest` (用于测试)
   - `supabaseProxy` (生产环境使用)
   - `testProxy` (基础测试)

#### 5.2 验证部署
1. 在微信开发者工具的云开发控制台中
2. 点击 "云函数"
3. 确认云函数显示为 "已部署" 状态

### 第六步：测试连接

#### 6.1 运行连接测试
1. 在 HBuilderX 中选择运行配置："Supabase连接测试"
2. 或导航到 `pages/test/supabaseTestSimple`
3. 填写配置信息：
   - **Supabase URL**: 从步骤 3.1 获取
   - **Anonymous Key**: 从步骤 3.1 获取
4. 点击 "测试连接"

#### 6.2 预期结果
如果配置正确，您应该看到：
- ✅ 连接状态显示 "已连接"
- ✅ 连接测试成功
- ✅ 表结构测试通过

## 🔧 高级配置

### 自定义域名（可选）
1. 在 Supabase Dashboard 中点击 "Settings" → "Custom Domains"
2. 添加您的域名
3. 配置 DNS 记录

### 数据库备份
1. 点击 "Settings" → "Database"
2. 启用自动备份
3. 设置备份频率

### 监控和分析
1. 点击 "Logs" 查看实时日志
2. 点击 "Reports" 查看使用统计
3. 设置告警通知

## 🚨 故障排除

### 常见问题

#### 连接失败
**症状**: 测试页面显示连接失败
**解决方案**:
1. 检查 Project URL 格式（必须以 https:// 开头）
2. 确认 API Key 正确（没有多余空格）
3. 检查网络连接
4. 验证云函数是否正确部署

#### 表访问失败
**症状**: 表结构测试失败
**解决方案**:
1. 确认 SQL 脚本已完全执行
2. 检查 RLS 策略是否正确创建
3. 验证表是否存在于 Table Editor 中

#### 权限错误
**症状**: 提示权限不足
**解决方案**:
1. 检查是否使用了正确的 API Key
2. 确认 RLS 策略允许操作
3. 临时禁用 RLS 进行测试：
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 获取帮助
1. 查看 Supabase 官方文档：https://supabase.com/docs
2. 加入 Supabase Discord 社区
3. 查看项目的测试日志和错误信息

## ✅ 配置检查清单

在完成配置后，请确认：

- [ ] Supabase 项目已创建
- [ ] 数据库表已创建（6个表）
- [ ] 索引已创建
- [ ] RLS 策略已设置
- [ ] Project URL 和 API Key 已获取
- [ ] 云函数环境变量已配置
- [ ] 云函数已部署
- [ ] 连接测试通过
- [ ] 表结构测试通过

完成这些步骤后，您的 Supabase 就配置完成了！

---

*配置过程中如有问题，请参考故障排除部分或查看测试页面的详细错误信息。*
