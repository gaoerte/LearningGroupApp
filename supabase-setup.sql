-- ========================================
-- Supabase 数据库完整设置脚本
-- 请在 Supabase Dashboard 的 SQL Editor 中运行
-- ========================================
-- 第一步：创建数据库表结构
-- ========================================
-- 1. 用户表
CREATE TABLE IF NOT EXISTS users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(255) UNIQUE NOT NULL,
    nickname varchar(100) NOT NULL,
    avatar_url text DEFAULT '/static/default-avatar.png',
    bio text DEFAULT '',
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    last_login timestamp with time zone DEFAULT NOW()
);

-- 2. 学习群组表
CREATE TABLE IF NOT EXISTS study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    description text DEFAULT '',
    subject varchar(50) DEFAULT '',
    max_members integer DEFAULT 50,
    creator_id uuid REFERENCES users(id) ON DELETE CASCADE,
    avatar_url text DEFAULT '/static/group-avatar.png',
    is_active boolean DEFAULT TRUE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 3. 群组成员表
CREATE TABLE IF NOT EXISTS group_members(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at timestamp with time zone DEFAULT NOW(),
    last_read_at timestamp with time zone DEFAULT NOW(),
    is_active boolean DEFAULT TRUE,
    UNIQUE (group_id, user_id)
);

-- 4. 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
    sender_name varchar(100) NOT NULL,
    content text NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    reply_to uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_deleted boolean DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 第二步：创建索引以提高性能
-- ========================================
-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 群组表索引
CREATE INDEX IF NOT EXISTS idx_groups_creator ON study_groups(creator_id);

CREATE INDEX IF NOT EXISTS idx_groups_subject ON study_groups(subject);

CREATE INDEX IF NOT EXISTS idx_groups_active ON study_groups(is_active);

-- 群组成员表索引
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_group_members_active ON group_members(is_active);

-- 聊天消息表索引
CREATE INDEX IF NOT EXISTS idx_messages_group_time ON chat_messages(group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_type ON chat_messages(type);

CREATE INDEX IF NOT EXISTS idx_messages_deleted ON chat_messages(is_deleted);

-- 第三步：启用行级安全（RLS）
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 第四步：创建 RLS 策略
-- ========================================
-- 用户表策略
DROP POLICY IF EXISTS "用户可查看公开信息" ON users;

CREATE POLICY "用户可查看公开信息" ON users
    FOR SELECT
        USING (TRUE);

DROP POLICY IF EXISTS "允许创建用户" ON users;

CREATE POLICY "允许创建用户" ON users
    FOR INSERT
        WITH CHECK (TRUE);

DROP POLICY IF EXISTS "用户可更新自己信息" ON users;

CREATE POLICY "用户可更新自己信息" ON users
    FOR UPDATE
        USING (TRUE);

-- 群组表策略
DROP POLICY IF EXISTS "查看活跃群组" ON study_groups;

CREATE POLICY "查看活跃群组" ON study_groups
    FOR SELECT
        USING (is_active = TRUE);

DROP POLICY IF EXISTS "允许创建群组" ON study_groups;

CREATE POLICY "允许创建群组" ON study_groups
    FOR INSERT
        WITH CHECK (TRUE);

DROP POLICY IF EXISTS "创建者可更新群组" ON study_groups;

CREATE POLICY "创建者可更新群组" ON study_groups
    FOR UPDATE
        USING (TRUE);

-- 群组成员表策略
DROP POLICY IF EXISTS "查看群组成员" ON group_members;

CREATE POLICY "查看群组成员" ON group_members
    FOR SELECT
        USING (TRUE);

DROP POLICY IF EXISTS "允许加入群组" ON group_members;

CREATE POLICY "允许加入群组" ON group_members
    FOR INSERT
        WITH CHECK (TRUE);

DROP POLICY IF EXISTS "更新成员信息" ON group_members;

CREATE POLICY "更新成员信息" ON group_members
    FOR UPDATE
        USING (TRUE);

-- 聊天消息表策略
DROP POLICY IF EXISTS "查看群组消息" ON chat_messages;

CREATE POLICY "查看群组消息" ON chat_messages
    FOR SELECT
        USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "发送群组消息" ON chat_messages;

CREATE POLICY "发送群组消息" ON chat_messages
    FOR INSERT
        WITH CHECK (TRUE);

DROP POLICY IF EXISTS "更新自己消息" ON chat_messages;

CREATE POLICY "更新自己消息" ON chat_messages
    FOR UPDATE
        USING (TRUE);

-- 第五步：插入测试数据
-- ========================================
-- 插入测试用户
INSERT INTO users(openid, nickname, avatar_url)
    VALUES ('test_user_001', '测试用户1', '/static/default-avatar.png'),
('test_user_002', '测试用户2', '/static/default-avatar.png'),
('test_user_003', 'AI助手', '/static/ai-avatar.png')
ON CONFLICT (openid)
    DO NOTHING;

-- 插入测试群组
INSERT INTO study_groups(name, description, creator_id)
    VALUES ('前端学习群', '一起学习前端技术，包括Vue、React、小程序开发',(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'test_user_001')),
('后端技术群',
        '分享后端开发经验，包括Node.js、Python、Java',
(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'test_user_002'))
ON CONFLICT
    DO NOTHING;

-- 添加群组成员
INSERT INTO group_members(group_id, user_id, role)
    VALUES ((
            SELECT
                id
            FROM
                study_groups
            WHERE
                name = '前端学习群'),(
                SELECT
                    id
                FROM
                    users
                WHERE
                    openid = 'test_user_001'), 'admin'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '前端学习群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'test_user_002'), 'member'),((
        SELECT
            id
        FROM study_groups
    WHERE
        name = '前端学习群'),(
    SELECT
        id
    FROM users
WHERE
    openid = 'test_user_003'), 'member'),((
        SELECT
            id
        FROM study_groups
    WHERE
        name = '后端技术群'),(
    SELECT
        id
    FROM users
WHERE
    openid = 'test_user_002'), 'admin'),((
        SELECT
            id
        FROM study_groups
    WHERE
        name = '后端技术群'),(
    SELECT
        id
    FROM users
WHERE
    openid = 'test_user_001'), 'member')
ON CONFLICT (group_id,
    user_id)
    DO NOTHING;

-- 插入测试消息
INSERT INTO chat_messages(group_id, sender_id, sender_name, content, type)
    VALUES ((
            SELECT
                id
            FROM
                study_groups
            WHERE
                name = '前端学习群'),(
                SELECT
                    id
                FROM
                    users
                WHERE
                    openid = 'test_user_001'), '测试用户1', '欢迎大家加入前端学习群！🎉', 'text'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '前端学习群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'test_user_003'), 'AI助手', '大家好！我是AI助手，有任何技术问题都可以问我 😊', 'text'),((
        SELECT
            id
        FROM study_groups
    WHERE
        name = '后端技术群'),(
    SELECT
        id
    FROM users
WHERE
    openid = 'test_user_002'), '测试用户2', '后端技术群建立啦！大家一起学习进步 💪', 'text')
ON CONFLICT
    DO NOTHING;

-- 第六步：验证安装
-- ========================================
-- 检查表是否创建成功
SELECT
    table_name,
(
        SELECT
            COUNT(*)
        FROM
            information_schema.columns
        WHERE
            table_name = t.table_name) AS column_count
FROM
    information_schema.tables t
WHERE
    table_schema = 'public'
    AND table_name IN ('users', 'study_groups', 'group_members', 'chat_messages')
ORDER BY
    table_name;

-- 检查测试数据
SELECT
    '用户数量' AS type,
    COUNT(*) AS count
FROM
    users
UNION ALL
SELECT
    '群组数量' AS type,
    COUNT(*) AS count
FROM
    study_groups
UNION ALL
SELECT
    '成员数量' AS type,
    COUNT(*) AS count
FROM
    group_members
UNION ALL
SELECT
    '消息数量' AS type,
    COUNT(*) AS count
FROM
    chat_messages;

-- 显示安装完成信息
SELECT
    '🎉 Supabase 数据库安装完成！' AS status,
    NOW() AS completed_at;

-- ========================================
-- 安装完成！
-- 现在可以在 uni-app 中测试真实数据连接了
-- ========================================
