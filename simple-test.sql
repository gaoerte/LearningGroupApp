-- ========================================
-- 超简单测试 SQL - 保证成功版本
-- ========================================
-- 清理并重新创建表
DROP TABLE IF EXISTS chat_messages CASCADE;

DROP TABLE IF EXISTS study_groups CASCADE;

DROP TABLE IF EXISTS users CASCADE;

-- 创建用户表
CREATE TABLE users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(255) UNIQUE NOT NULL,
    nickname varchar(100) NOT NULL
);

-- 创建群组表
CREATE TABLE study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    creator_id uuid REFERENCES users(id)
);

-- 创建消息表
CREATE TABLE chat_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id),
    sender_id uuid REFERENCES users(id),
    sender_name varchar(100) NOT NULL,
    content text NOT NULL
);

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 创建宽松策略
CREATE POLICY "allow_all" ON users
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY "allow_all" ON study_groups
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY "allow_all" ON chat_messages
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

-- 插入测试数据
INSERT INTO users(openid, nickname)
    VALUES ('test_001', '测试用户'),
('test_002', 'AI助手');

INSERT INTO study_groups(name, creator_id)
    VALUES ('测试群组',(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'test_001'));

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
        openid = 'test_002'), 'AI助手', '测试连接成功！😊');

-- 验证结果
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

-- 显示数据
SELECT
    sender_name,
    content
FROM
    chat_messages
ORDER BY
    id;

SELECT
    '🎉 测试数据库创建成功！' AS status;

