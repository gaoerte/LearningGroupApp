# 🎯 Supabase 数据库配置指南

## 📌 当前进度
✅ uniCloud 云函数部署成功  
✅ 云函数连接测试通过  
✅ 聊天基本功能正常  
🔄 **下一步：配置 Supabase 数据库**

## 🗄️ 第一步：创建数据库表结构

### 1. 打开 Supabase Dashboard
访问：https://supabase.com/dashboard/projects
选择您的项目：`klpseujbhwvifsfshfdx`

### 2. 创建用户表（users）
```sql
-- 用户表
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  openid VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  avatar_url TEXT DEFAULT '/static/default-avatar.png',
  bio TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 3. 创建群组表（study_groups）
```sql
-- 学习群组表
CREATE TABLE study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  subject VARCHAR(50) DEFAULT '',
  max_members INTEGER DEFAULT 50,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT DEFAULT '/static/group-avatar.png',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX idx_groups_creator ON study_groups(creator_id);
CREATE INDEX idx_groups_subject ON study_groups(subject);
CREATE INDEX idx_groups_active ON study_groups(is_active);
```

### 4. 创建群组成员表（group_members）
```sql
-- 群组成员表
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(group_id, user_id)
);

-- 添加索引
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_active ON group_members(is_active);
```

### 5. 创建聊天消息表（chat_messages）
```sql
-- 聊天消息表
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- text, image, file, system
  reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX idx_messages_group ON chat_messages(group_id, created_at DESC);
CREATE INDEX idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_messages_type ON chat_messages(type);
CREATE INDEX idx_messages_deleted ON chat_messages(is_deleted);
```

## 🔐 第二步：配置 RLS（行级安全）策略

### 1. 启用 RLS
```sql
-- 为所有表启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
```

### 2. 用户表策略
```sql
-- 用户可以查看所有用户基本信息
CREATE POLICY "用户可查看公开信息" ON users
  FOR SELECT USING (true);

-- 用户只能更新自己的信息
CREATE POLICY "用户可更新自己信息" ON users
  FOR UPDATE USING (openid = current_setting('app.current_user_openid', true));

-- 允许创建新用户
CREATE POLICY "允许创建用户" ON users
  FOR INSERT WITH CHECK (true);
```

### 3. 群组表策略
```sql
-- 所有人可以查看活跃群组
CREATE POLICY "查看活跃群组" ON study_groups
  FOR SELECT USING (is_active = true);

-- 群组创建者可以更新群组
CREATE POLICY "创建者可更新群组" ON study_groups
  FOR UPDATE USING (
    creator_id IN (
      SELECT id FROM users 
      WHERE openid = current_setting('app.current_user_openid', true)
    )
  );

-- 允许创建群组
CREATE POLICY "允许创建群组" ON study_groups
  FOR INSERT WITH CHECK (true);
```

### 4. 群组成员策略
```sql
-- 群组成员可以查看同群组成员
CREATE POLICY "查看群组成员" ON group_members
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members gm
      JOIN users u ON u.id = gm.user_id
      WHERE u.openid = current_setting('app.current_user_openid', true)
      AND gm.is_active = true
    )
  );

-- 允许加入群组
CREATE POLICY "允许加入群组" ON group_members
  FOR INSERT WITH CHECK (true);
```

### 5. 聊天消息策略
```sql
-- 群组成员可以查看消息
CREATE POLICY "查看群组消息" ON chat_messages
  FOR SELECT USING (
    group_id IN (
      SELECT gm.group_id FROM group_members gm
      JOIN users u ON u.id = gm.user_id
      WHERE u.openid = current_setting('app.current_user_openid', true)
      AND gm.is_active = true
    )
    AND is_deleted = false
  );

-- 群组成员可以发送消息
CREATE POLICY "发送群组消息" ON chat_messages
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT gm.group_id FROM group_members gm
      JOIN users u ON u.id = gm.user_id
      WHERE u.openid = current_setting('app.current_user_openid', true)
      AND gm.is_active = true
    )
  );
```

## 🧪 第三步：测试数据库连接

### 1. 在 Supabase SQL Editor 中运行测试
```sql
-- 测试查询
SELECT NOW() as current_time;

-- 检查表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'study_groups', 'group_members', 'chat_messages');
```

### 2. 插入测试数据
```sql
-- 插入测试用户
INSERT INTO users (openid, nickname) VALUES 
('test_user_001', '测试用户1'),
('test_user_002', '测试用户2');

-- 插入测试群组
INSERT INTO study_groups (name, description, creator_id) VALUES 
('前端学习群', '一起学习前端技术', (SELECT id FROM users WHERE openid = 'test_user_001'));

-- 测试查询
SELECT * FROM users;
SELECT * FROM study_groups;
```

## ✅ 完成检查清单

- [ ] 创建所有数据库表
- [ ] 配置 RLS 策略  
- [ ] 测试基本查询
- [ ] 插入测试数据
- [ ] 验证权限控制

## 🎯 执行步骤

**立即行动：**
1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制并执行上面的 SQL 语句
4. 验证表创建成功

完成数据库配置后，我们就可以测试真实的数据交互了！

---

**💡 提示：整个数据库配置过程大约需要 15-20 分钟。**
