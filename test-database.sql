-- ========================================
-- 测试用 SQL 脚本 - 最简版本
-- 用于快速测试 Supabase 连接
-- ========================================
-- 第一步：清理可能存在的表（重新开始）
DROP TABLE IF EXISTS chat_messages CASCADE;

DROP TABLE IF EXISTS study_groups CASCADE;

DROP TABLE IF EXISTS users CASCADE;

-- 第二步：创建最基本的表结构
CREATE TABLE users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(255) UNIQUE NOT NULL,
    nickname varchar(100) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    creator_id uuid REFERENCES users(id),
    created_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE chat_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id),
    sender_id uuid REFERENCES users(id),
    sender_name varchar(100) NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 第三步：启用宽松的RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略
DROP POLICY IF EXISTS "test_allow_all_users" ON users;

DROP POLICY IF EXISTS "test_allow_all_groups" ON study_groups;

DROP POLICY IF EXISTS "test_allow_all_messages" ON chat_messages;

-- 创建新策略
CREATE POLICY "test_allow_all_users" ON users
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY "test_allow_all_groups" ON study_groups
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY "test_allow_all_messages" ON chat_messages
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

-- 第四步：插入测试数据
INSERT INTO users(openid, nickname)
    VALUES ('test_001', '测试用户'),
('test_002', 'AI助手')
ON CONFLICT (openid)
    DO NOTHING;

INSERT INTO study_groups(name, creator_id)
    VALUES ('测试群组',(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'test_001'))
ON CONFLICT
    DO NOTHING;

INSERT INTO chat_messages(group_id, sender_id, sender_name, content)
    VALUES ((
            SELECT
                id
            FROM
                study_groups
            WHERE
                name = '测试群组'),(
                SELECT
                    id
                FROM
                    users
                WHERE
                    openid = 'test_001'), '测试用户', '这是测试消息 🎉'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '测试群组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'test_002'), 'AI助手', '测试连接成功！😊')
ON CONFLICT
    DO NOTHING;

-- 第五步：验证结果
SELECT
    'users' AS table_name,
    COUNT(*) AS count
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
    'messages',
    COUNT(*)
FROM
    chat_messages;

-- 显示测试数据
SELECT
    cm.content,
    cm.sender_name,
    cm.created_at
FROM
    chat_messages cm
ORDER BY
    cm.created_at;

SELECT
    '✅ 测试数据库创建完成' AS status;

