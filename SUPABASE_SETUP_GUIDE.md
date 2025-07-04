# Supabase 数据库快速设置指南

## 🚀 快速开始

你已经有了Supabase项目配置！现在只需要3个步骤就能让创建的群组直接保存到真实数据库：

### 步骤1: 在Supabase中创建数据库表

1. **打开你的Supabase项目**: https://klpseujbhwvifsfshfdx.supabase.co
2. **进入SQL编辑器** (左侧菜单 → SQL Editor)
3. **复制粘贴下面的SQL**，然后点击"RUN"

### 步骤2: 上传云函数

1. 在HBuilderX中右键 `uniCloud-tcb/cloudfunctions/learningGroupAPI`
2. 选择"上传并部署"
3. 等待部署完成

### 步骤3: 测试创建群组

1. 运行你的应用
2. 进入"学习群组"页面
3. 点击"创建群组"
4. 填写信息并创建
5. 查看Supabase数据库中的新数据！

---

## 📝 SQL 数据库脚本

复制下面的SQL到Supabase SQL编辑器中执行：

```sql
-- ========================================
-- 学习小组App 生产数据库
-- ========================================

-- 清理现有表（如果存在）
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS study_groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. 用户表
CREATE TABLE users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(255) UNIQUE NOT NULL,
    nickname varchar(100) NOT NULL,
    avatar_url text,
    bio text,
    join_date timestamp with time zone DEFAULT now(),
    last_active timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT TRUE
);

-- 2. 学习小组表
CREATE TABLE study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    description text,
    category varchar(50) DEFAULT 'general',
    creator_id uuid REFERENCES users(id) ON DELETE SET NULL,
    max_members integer DEFAULT 50,
    is_public boolean DEFAULT TRUE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. 群组成员表
CREATE TABLE group_members(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role varchar(20) DEFAULT 'member', -- member, admin, creator
    joined_at timestamp with time zone DEFAULT now(),
    is_muted boolean DEFAULT FALSE,
    UNIQUE (group_id, user_id)
);

-- 4. 聊天消息表
CREATE TABLE chat_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
    sender_name varchar(100) NOT NULL,
    content text NOT NULL,
    message_type varchar(20) DEFAULT 'text', -- text, image, file, system
    reply_to uuid REFERENCES chat_messages(id),
    is_deleted boolean DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 创建索引优化查询性能
CREATE INDEX idx_chat_messages_group_id ON chat_messages(group_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 创建安全策略（允许所有操作，适合开发测试）
CREATE POLICY "allow_all_users" ON users FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_groups" ON study_groups FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_members" ON group_members FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "allow_all_messages" ON chat_messages FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 插入测试用户（可选）
INSERT INTO users(openid, nickname, avatar_url, bio) VALUES 
('test_user_001', '测试用户1', '/static/logo.png', '我是第一个测试用户'),
('test_user_002', '测试用户2', '/static/logo.png', '我是第二个测试用户');

-- 验证创建结果
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'study_groups', COUNT(*) FROM study_groups
UNION ALL  
SELECT 'group_members', COUNT(*) FROM group_members
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages;

SELECT '🎉 数据库创建成功！现在可以创建真实的群组了！' AS status;
```

---

## ✅ 验证步骤

执行SQL后，你应该看到：
- ✅ 4个表创建成功
- ✅ 索引创建成功  
- ✅ 安全策略创建成功
- ✅ 2个测试用户插入成功

## 🎯 现在可以做什么

1. **创建群组** → 数据直接保存到Supabase
2. **加入群组** → 成员关系保存到数据库
3. **发送消息** → 聊天记录保存到数据库
4. **查看群组列表** → 从数据库获取真实数据

## 📊 查看数据

在Supabase的"Table Editor"中可以实时查看：
- `users` - 用户数据
- `study_groups` - 你创建的群组
- `group_members` - 群组成员关系
- `chat_messages` - 聊天消息

🚀 **开始创建你的第一个真实群组吧！**
