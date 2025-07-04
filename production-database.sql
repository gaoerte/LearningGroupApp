-- ========================================
-- 生产用 SQL 脚本 - 完整版本
-- 用于正式部署的完整数据库结构
-- ========================================
-- 创建完整的表结构
CREATE TABLE IF NOT EXISTS users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(255) UNIQUE NOT NULL,
    nickname varchar(100) NOT NULL,
    avatar_url text DEFAULT '/static/default-avatar.png',
    bio text DEFAULT '',
    email varchar(255),
    phone varchar(20),
    is_active boolean DEFAULT TRUE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    last_login timestamp with time zone DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    description text DEFAULT '',
    subject varchar(50) DEFAULT '',
    max_members integer DEFAULT 50,
    current_members integer DEFAULT 0,
    creator_id uuid REFERENCES users(id) ON DELETE CASCADE,
    avatar_url text DEFAULT '/static/group-avatar.png',
    is_active boolean DEFAULT TRUE,
    is_public boolean DEFAULT TRUE,
    tags text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- admin, moderator, member
    joined_at timestamp with time zone DEFAULT NOW(),
    last_read_at timestamp with time zone DEFAULT NOW(),
    is_active boolean DEFAULT TRUE,
    is_muted boolean DEFAULT FALSE,
    UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
    sender_name varchar(100) NOT NULL,
    content text NOT NULL,
    type VARCHAR(20) DEFAULT 'text', -- text, image, file, system, announcement
    reply_to uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_deleted boolean DEFAULT FALSE,
    is_edited boolean DEFAULT FALSE,
    mentions uuid[] DEFAULT '{}',
    attachments jsonb DEFAULT '[]',
    reactions jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    is_online boolean DEFAULT TRUE,
    last_seen timestamp with time zone DEFAULT NOW(),
    typing_status boolean DEFAULT FALSE,
    device_info jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (user_id, group_id)
);

CREATE TABLE IF NOT EXISTS group_invitations(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    inviter_id uuid REFERENCES users(id) ON DELETE CASCADE,
    invitee_openid varchar(255) NOT NULL,
    invitation_code varchar(100) UNIQUE NOT NULL,
    status varchar(20) DEFAULT 'pending', -- pending, accepted, declined, expired
    expires_at timestamp with time zone DEFAULT (NOW() + interval '7 days'),
    created_at timestamp with time zone DEFAULT NOW()
);

-- 创建性能优化索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);

CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_groups_creator ON study_groups(creator_id);

CREATE INDEX IF NOT EXISTS idx_groups_subject ON study_groups(subject);

CREATE INDEX IF NOT EXISTS idx_groups_active ON study_groups(is_active);

CREATE INDEX IF NOT EXISTS idx_groups_public ON study_groups(is_public);

CREATE INDEX IF NOT EXISTS idx_groups_created ON study_groups(created_at);

CREATE INDEX IF NOT EXISTS idx_members_group ON group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_members_user ON group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_members_active ON group_members(is_active);

CREATE INDEX IF NOT EXISTS idx_members_role ON group_members(ROLE);

CREATE INDEX IF NOT EXISTS idx_messages_group_time ON chat_messages(group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_type ON chat_messages(type);

CREATE INDEX IF NOT EXISTS idx_messages_deleted ON chat_messages(is_deleted);

CREATE INDEX IF NOT EXISTS idx_messages_reply ON chat_messages(reply_to);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_group ON user_sessions(group_id);

CREATE INDEX IF NOT EXISTS idx_sessions_online ON user_sessions(is_online);

CREATE INDEX IF NOT EXISTS idx_invitations_group ON group_invitations(group_id);

CREATE INDEX IF NOT EXISTS idx_invitations_code ON group_invitations(invitation_code);

CREATE INDEX IF NOT EXISTS idx_invitations_status ON group_invitations(status);

-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略
DROP POLICY IF EXISTS "users_select_public" ON users;

DROP POLICY IF EXISTS "users_insert_self" ON users;

DROP POLICY IF EXISTS "users_update_self" ON users;

DROP POLICY IF EXISTS "groups_select_public" ON study_groups;

DROP POLICY IF EXISTS "groups_insert_authenticated" ON study_groups;

DROP POLICY IF EXISTS "groups_update_creator" ON study_groups;

DROP POLICY IF EXISTS "members_select_group" ON group_members;

DROP POLICY IF EXISTS "members_insert_join" ON group_members;

DROP POLICY IF EXISTS "members_update_self" ON group_members;

DROP POLICY IF EXISTS "messages_select_member" ON chat_messages;

DROP POLICY IF EXISTS "messages_insert_member" ON chat_messages;

DROP POLICY IF EXISTS "messages_update_sender" ON chat_messages;

DROP POLICY IF EXISTS "sessions_all_operations" ON user_sessions;

DROP POLICY IF EXISTS "invitations_select_related" ON group_invitations;

DROP POLICY IF EXISTS "invitations_insert_member" ON group_invitations;

DROP POLICY IF EXISTS "invitations_update_related" ON group_invitations;

-- 创建安全策略
-- 用户表策略
CREATE POLICY "users_select_public" ON users
    FOR SELECT
        USING (is_active = TRUE);

CREATE POLICY "users_insert_self" ON users
    FOR INSERT
        WITH CHECK (TRUE);

CREATE POLICY "users_update_self" ON users
    FOR UPDATE
        USING (TRUE);

-- 群组表策略
CREATE POLICY "groups_select_public" ON study_groups
    FOR SELECT
        USING (is_active = TRUE);

CREATE POLICY "groups_insert_authenticated" ON study_groups
    FOR INSERT
        WITH CHECK (TRUE);

CREATE POLICY "groups_update_creator" ON study_groups
    FOR UPDATE
        USING (TRUE);

-- 群组成员策略
CREATE POLICY "members_select_group" ON group_members
    FOR SELECT
        USING (is_active = TRUE);

CREATE POLICY "members_insert_join" ON group_members
    FOR INSERT
        WITH CHECK (TRUE);

CREATE POLICY "members_update_self" ON group_members
    FOR UPDATE
        USING (TRUE);

-- 聊天消息策略
CREATE POLICY "messages_select_member" ON chat_messages
    FOR SELECT
        USING (is_deleted = FALSE);

CREATE POLICY "messages_insert_member" ON chat_messages
    FOR INSERT
        WITH CHECK (TRUE);

CREATE POLICY "messages_update_sender" ON chat_messages
    FOR UPDATE
        USING (TRUE);

-- 用户会话策略
CREATE POLICY "sessions_all_operations" ON user_sessions
    FOR ALL
        USING (TRUE)
        WITH CHECK (TRUE);

-- 群组邀请策略
CREATE POLICY "invitations_select_related" ON group_invitations
    FOR SELECT
        USING (TRUE);

CREATE POLICY "invitations_insert_member" ON group_invitations
    FOR INSERT
        WITH CHECK (TRUE);

CREATE POLICY "invitations_update_related" ON group_invitations
    FOR UPDATE
        USING (TRUE);

-- 创建有用的视图
CREATE OR REPLACE VIEW group_stats AS
SELECT
    sg.id,
    sg.name,
    sg.description,
    sg.subject,
    COUNT(gm.user_id) AS member_count,
    COUNT(
        CASE WHEN gm.role = 'admin' THEN
            1
        END) AS admin_count,
    sg.max_members,
    sg.is_active,
    sg.created_at
FROM
    study_groups sg
    LEFT JOIN group_members gm ON sg.id = gm.group_id
        AND gm.is_active = TRUE
WHERE
    sg.is_active = TRUE
GROUP BY
    sg.id,
    sg.name,
    sg.description,
    sg.subject,
    sg.max_members,
    sg.is_active,
    sg.created_at;

CREATE OR REPLACE VIEW user_group_summary AS
SELECT
    u.id AS user_id,
    u.nickname,
    u.avatar_url,
    COUNT(gm.group_id) AS joined_groups,
    COUNT(
        CASE WHEN gm.role = 'admin' THEN
            1
        END) AS admin_groups,
    u.last_login,
    u.is_active
FROM
    users u
    LEFT JOIN group_members gm ON u.id = gm.user_id
        AND gm.is_active = TRUE
WHERE
    u.is_active = TRUE
GROUP BY
    u.id,
    u.nickname,
    u.avatar_url,
    u.last_login,
    u.is_active;

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_group_member_count()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_active = TRUE THEN
        UPDATE
            study_groups
        SET
            current_members = current_members + 1
        WHERE
            id = NEW.group_id;
    ELSIF TG_OP = 'UPDATE'
            AND OLD.is_active = TRUE
            AND NEW.is_active = FALSE THEN
            UPDATE
                study_groups
            SET
                current_members = current_members - 1
            WHERE
                id = NEW.group_id;
    ELSIF TG_OP = 'UPDATE'
            AND OLD.is_active = FALSE
            AND NEW.is_active = TRUE THEN
            UPDATE
                study_groups
            SET
                current_members = current_members + 1
            WHERE
                id = NEW.group_id;
    ELSIF TG_OP = 'DELETE'
            AND OLD.is_active = TRUE THEN
            UPDATE
                study_groups
            SET
                current_members = current_members - 1
            WHERE
                id = OLD.group_id;
    END IF;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$
LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_group_member_count ON group_members;

CREATE TRIGGER trigger_update_group_member_count
    AFTER INSERT OR UPDATE OR DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_group_member_count();

-- 插入初始数据
INSERT INTO users(openid, nickname, avatar_url, bio)
    VALUES ('admin_001', '系统管理员', '/static/admin-avatar.png', '学习小组App管理员'),
('ai_assistant', 'AI学习助手', '/static/ai-avatar.png', '智能学习助手，随时为您答疑解惑'),
('demo_user_001', '演示用户1', '/static/demo-avatar-1.png', '前端开发爱好者'),
('demo_user_002', '演示用户2', '/static/demo-avatar-2.png', '后端技术专家')
ON CONFLICT (openid)
    DO NOTHING;

INSERT INTO study_groups(name, description, subject, creator_id, max_members)
    VALUES ('前端技术交流群', '专注于前端开发技术分享，包括Vue、React、微信小程序等', '前端开发',(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'demo_user_001'), 100),('后端架构讨论群', '后端技术架构设计与实践，Node.js、Python、Java等', '后端开发',(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'demo_user_002'), 100),('AI与机器学习', '人工智能、机器学习技术研究与应用', 'AI/ML',(
            SELECT
                id
            FROM
                users
            WHERE
                openid = 'ai_assistant'), 50)
ON CONFLICT
    DO NOTHING;

-- 验证数据库结构
SELECT
    'tables' AS type,
    COUNT(*) AS count
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name IN ('users', 'study_groups', 'group_members', 'chat_messages', 'user_sessions', 'group_invitations');

SELECT
    'indexes' AS type,
    COUNT(*) AS count
FROM
    pg_indexes
WHERE
    schemaname = 'public';

SELECT
    'policies' AS type,
    COUNT(*) AS count
FROM
    pg_policies;

SELECT
    '🎉 生产数据库创建完成！' AS status,
    NOW() AS completed_at;

