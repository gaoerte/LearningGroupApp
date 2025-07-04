-- ========================================
-- 学习小组App 完整生产数据库脚本
-- 直接复制到Supabase SQL编辑器运行
-- ========================================
-- 清理现有表（安全删除）
DROP TABLE IF EXISTS chat_messages CASCADE;

DROP TABLE IF EXISTS group_members CASCADE;

DROP TABLE IF EXISTS study_groups CASCADE;

DROP TABLE IF EXISTS users CASCADE;

-- 清理现有视图
DROP VIEW IF EXISTS group_messages_with_details;

DROP VIEW IF EXISTS group_member_details;

-- ========================================
-- 表结构创建
-- ========================================
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

-- ========================================
-- 索引创建（优化查询性能）
-- ========================================
CREATE INDEX idx_chat_messages_group_id ON chat_messages(group_id);

CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);

CREATE INDEX idx_group_members_user_id ON group_members(user_id);

CREATE INDEX idx_study_groups_category ON study_groups(category);

CREATE INDEX idx_study_groups_is_public ON study_groups(is_public);

CREATE INDEX idx_users_openid ON users(openid);

-- ========================================
-- 行级安全策略配置
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 创建安全策略（开发阶段允许所有操作）
CREATE POLICY "allow_all_users" ON users
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY "allow_all_groups" ON study_groups
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY "allow_all_members" ON group_members
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

CREATE POLICY "allow_all_messages" ON chat_messages
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

-- ========================================
-- 初始测试数据插入
-- ========================================
-- 插入测试用户
INSERT INTO users(openid, nickname, avatar_url, bio)
    VALUES ('user_001', '张小明', '/static/avatars/user1.png', '热爱前端开发的程序员'),
('user_002', '李小红', '/static/avatars/user2.png', 'UI/UX设计师'),
('user_003', 'AI助手', '/static/avatars/ai.png', '智能学习助手，随时为你答疑解惑'),
('user_004', '王小强', '/static/avatars/user3.png', '全栈开发工程师'),
('user_005', '赵小美', '/static/avatars/user4.png', '产品经理'),
('test_user_001', '测试用户1', '/static/logo.png', '我是第一个测试用户'),
('test_user_002', '测试用户2', '/static/logo.png', '我是第二个测试用户');

-- 插入测试群组
INSERT INTO study_groups(name, description, category, creator_id)
    VALUES ('前端开发学习小组', '一起学习React、Vue、JavaScript等前端技术，分享经验，共同进步', 'programming',(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'user_001')),
('UI设计交流群',
        '分享设计灵感，讨论用户体验，提升设计技能',
        'design',
(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'user_002')),
('算法学习群',
        '每日一题，提升算法思维，准备技术面试',
        'algorithm',
(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'user_004')),
('英语口语练习',
        '每日口语练习，提高英语表达能力',
        'language',
(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'user_005')),
('考研数学讨论组',
        '考研数学真题讨论，知识点梳理',
        'exam',
(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'user_003'));

-- 插入群组成员关系
INSERT INTO group_members(group_id, user_id, role)
    VALUES
        -- 前端开发学习小组
((
                SELECT
                    id
                FROM
                    study_groups
                WHERE
                    name = '前端开发学习小组'),(
                    SELECT
                        id
                    FROM
                        users
                    WHERE
                        openid = 'user_001'), 'creator'),((
                SELECT
                    id
                FROM study_groups
            WHERE
                name = '前端开发学习小组'),(
            SELECT
                id
            FROM users
        WHERE
            openid = 'user_002'), 'member'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '前端开发学习小组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_003'), 'member'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '前端开发学习小组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_004'), 'admin'),
        -- UI设计交流群
((
            SELECT
                id
            FROM study_groups
        WHERE
            name = 'UI设计交流群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_002'), 'creator'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = 'UI设计交流群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_001'), 'member'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = 'UI设计交流群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_005'), 'member'),
        -- 算法学习群
((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '算法学习群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_004'), 'creator'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '算法学习群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_001'), 'member'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '算法学习群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_003'), 'member'),
        -- 英语口语练习
((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '英语口语练习'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_005'), 'creator'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '英语口语练习'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_002'), 'member'),
        -- 考研数学讨论组
((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '考研数学讨论组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_003'), 'creator'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '考研数学讨论组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_004'), 'member');

-- 插入测试聊天消息
INSERT INTO chat_messages(group_id, sender_id, sender_name, content, message_type)
    VALUES
        -- 前端开发学习小组消息
((
                SELECT
                    id
                FROM
                    study_groups
                WHERE
                    name = '前端开发学习小组'),(
                    SELECT
                        id
                    FROM
                        users
                    WHERE
                        openid = 'user_001'), '张小明', '大家好！欢迎加入前端开发学习小组，让我们一起进步！🎉', 'text'),((
                SELECT
                    id
                FROM study_groups
            WHERE
                name = '前端开发学习小组'),(
            SELECT
                id
            FROM users
        WHERE
            openid = 'user_002'), '李小红', '很开心能加入这个小组，希望能学到更多前端知识', 'text'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '前端开发学习小组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_003'), 'AI助手', '我是AI助手，有任何前端问题都可以问我哦～', 'text'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '前端开发学习小组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_004'), '王小强', '最近在学React Hooks，有没有好的学习资源推荐？', 'text'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '前端开发学习小组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_001'), '张小明', '推荐官方文档和一些实战项目，边学边做效果最好', 'text'),
        -- UI设计交流群消息
((
            SELECT
                id
            FROM study_groups
        WHERE
            name = 'UI设计交流群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_002'), '李小红', '分享一个很棒的设计灵感网站：dribbble.com', 'text'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = 'UI设计交流群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_005'), '赵小美', '谢谢分享！最近正在找设计参考', 'text'),
        -- 算法学习群消息
((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '算法学习群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_004'), '王小强', '今日算法题：两数之和，大家来挑战一下！', 'text'),((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '算法学习群'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_001'), '张小明', '用哈希表可以优化到O(n)时间复杂度', 'text'),
        -- 英语口语练习消息
((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '英语口语练习'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_005'), '赵小美', 'Hello everyone! Let\'s practice English together! 🗣️', 'text'),
        -- 考研数学讨论组消息
((
            SELECT
                id
            FROM study_groups
        WHERE
            name = '考研数学讨论组'),(
        SELECT
            id
        FROM users
    WHERE
        openid = 'user_003'), 'AI助手', '今天我们来讨论高等数学中的极限问题', 'text');

-- ========================================
-- 创建便于查询的视图
-- ========================================
-- 群组消息详情视图
CREATE VIEW group_messages_with_details AS
SELECT
    cm.id,
    cm.content,
    cm.message_type,
    cm.created_at,
    cm.sender_name,
    sg.name AS group_name,
    sg.id AS group_id,
    u.nickname AS sender_nickname,
    u.avatar_url AS sender_avatar
FROM
    chat_messages cm
    LEFT JOIN study_groups sg ON cm.group_id = sg.id
    LEFT JOIN users u ON cm.sender_id = u.id
WHERE
    cm.is_deleted = FALSE
ORDER BY
    cm.created_at ASC;

-- 群组成员详情视图
CREATE VIEW group_member_details AS
SELECT
    gm.group_id,
    gm.user_id,
    gm.role,
    gm.joined_at,
    u.nickname,
    u.avatar_url,
    u.last_active,
    sg.name AS group_name
FROM
    group_members gm
    JOIN users u ON gm.user_id = u.id
    JOIN study_groups sg ON gm.group_id = sg.id;

-- 群组统计视图
CREATE VIEW group_stats AS
SELECT
    sg.id,
    sg.name,
    sg.description,
    sg.category,
    sg.is_public,
    sg.max_members,
    sg.created_at,
    u.nickname AS creator_name,
    COUNT(DISTINCT gm.user_id) AS member_count,
    COUNT(DISTINCT cm.id) AS message_count,
    MAX(cm.created_at) AS last_message_time
FROM
    study_groups sg
    LEFT JOIN users u ON sg.creator_id = u.id
    LEFT JOIN group_members gm ON sg.id = gm.group_id
    LEFT JOIN chat_messages cm ON sg.id = cm.group_id
        AND cm.is_deleted = FALSE
GROUP BY
    sg.id,
    sg.name,
    sg.description,
    sg.category,
    sg.is_public,
    sg.max_members,
    sg.created_at,
    u.nickname
ORDER BY
    sg.created_at DESC;

-- ========================================
-- 数据验证和统计
-- ========================================
-- 验证数据插入结果
SELECT
    '📊 数据统计' AS info,
    'users' AS table_name,
    COUNT(*) AS count
FROM
    users
UNION ALL
SELECT
    '📊 数据统计',
    'study_groups',
    COUNT(*)
FROM
    study_groups
UNION ALL
SELECT
    '📊 数据统计',
    'group_members',
    COUNT(*)
FROM
    group_members
UNION ALL
SELECT
    '📊 数据统计',
    'chat_messages',
    COUNT(*)
FROM
    chat_messages;

-- 显示群组详细信息
SELECT
    '🏆 群组信息' AS info,
    sg.name AS group_name,
    sg.category,
    u.nickname AS creator,
    COUNT(gm.user_id) AS members,
    sg.created_at
FROM
    study_groups sg
    LEFT JOIN users u ON sg.creator_id = u.id
    LEFT JOIN group_members gm ON sg.id = gm.group_id
GROUP BY
    sg.id,
    sg.name,
    sg.category,
    u.nickname,
    sg.created_at
ORDER BY
    sg.created_at;

-- 显示成功信息
SELECT
    '🎉 数据库创建完成！' AS status,
    '✅ 表结构已创建' AS tables,
    '✅ 索引已优化' AS indexes,
    '✅ 安全策略已配置' AS
    SECURITY,
    '✅ 测试数据已插入' AS data,
    '✅ 视图已创建' AS views,
    '🚀 现在可以开始使用了！' AS ready;

