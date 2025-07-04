-- ========================================
-- Supabase 数据库快速修复脚本
-- 请在 Supabase Dashboard 的 SQL Editor 中运行
-- ========================================
-- 第一步：删除可能存在的表（如果需要重新开始）
-- ========================================
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS group_members CASCADE;
-- DROP TABLE IF EXISTS study_groups CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- 第二步：创建数据库表结构（简化版）
-- ========================================
-- 1. 用户表
CREATE TABLE IF NOT EXISTS users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(255) UNIQUE NOT NULL,
    nickname varchar(100) NOT NULL,
    avatar_url text DEFAULT '/static/default-avatar.png',
    created_at timestamp with time zone DEFAULT NOW()
);

-- 2. 学习群组表（简化版）
CREATE TABLE IF NOT EXISTS study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    description text DEFAULT '',
    creator_id uuid REFERENCES users(id) ON DELETE CASCADE,
    is_active boolean DEFAULT TRUE,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 3. 群组成员表
CREATE TABLE IF NOT EXISTS group_members(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at timestamp with time zone DEFAULT NOW(),
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
    created_at timestamp with time zone DEFAULT NOW()
);

-- 第三步：创建基本索引
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_messages_group_time ON chat_messages(group_id, created_at DESC);

-- 第四步：启用行级安全但使用宽松策略
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 宽松的RLS策略（允许所有操作，方便测试）
CREATE POLICY IF NOT EXISTS "allow_all_users" ON users
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY IF NOT EXISTS "allow_all_groups" ON study_groups
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY IF NOT EXISTS "allow_all_members" ON group_members
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY IF NOT EXISTS "allow_all_messages" ON chat_messages
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

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
    openid = 'test_user_003'), 'member')
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
        name = '前端学习群'),(
    SELECT
        id
    FROM users
WHERE
    openid = 'test_user_002'), '测试用户2', '这个群真不错，大家一起学习！💪', 'text')
ON CONFLICT
    DO NOTHING;

-- 第六步：验证安装
-- ========================================
-- 检查表是否创建成功
SELECT
    'tables_created' AS status,
    COUNT(*) AS table_count
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name IN ('users', 'study_groups', 'group_members', 'chat_messages');

-- 检查测试数据
SELECT
    'users' AS table_name,
    COUNT(*) AS record_count
FROM
    users
UNION ALL
SELECT
    'groups',
    COUNT(*)
FROM
    study_groups
UNION ALL
SELECT
    'members',
    COUNT(*)
FROM
    group_members
UNION ALL
SELECT
    'messages',
    COUNT(*)
FROM
    chat_messages;

-- 显示一些示例数据
SELECT
    u.nickname AS user_name,
    sg.name AS group_name,
    cm.content AS message_content,
    cm.created_at
FROM
    chat_messages cm
    JOIN users u ON u.id = cm.sender_id
    JOIN study_groups sg ON sg.id = cm.group_id
ORDER BY
    cm.created_at
LIMIT 5;

-- 显示安装完成信息
SELECT
    '🎉 Supabase 数据库安装完成！' AS status,
    NOW() AS completed_at;

-- ========================================
-- 安装完成！现在可以测试真实数据连接了！
-- ========================================
