/**
 * 优化后的 Supabase 数据库表结构设计
 * 修复了安全策略、扩展了字段、增加了实用功能
 */
-- =============================================
-- 1. 用户表 (优化版)
-- =============================================
CREATE TABLE users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar UNIQUE NOT NULL,
    nickname varchar(50),
    avatar_url text,
    phone varchar(20),
    email varchar(100),
    gender varchar(10) CHECK (gender IN ('male', 'female', 'unknown')),
    birth_date date,
    location varchar(100),
    bio text,
    study_time_per_day integer DEFAULT 0, -- 每日学习时长(分钟)
    total_checkin_days integer DEFAULT 0, -- 总打卡天数
    continuous_checkin_days integer DEFAULT 0, -- 连续打卡天数
    level integer DEFAULT 1, -- 用户等级
    experience_points integer DEFAULT 0, -- 经验值
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 用户设置表（扩展表）
CREATE TABLE user_settings(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    notification_enabled boolean DEFAULT TRUE,
    reminder_time time DEFAULT '20:00:00', -- 打卡提醒时间
    privacy_level varchar(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
    language varchar
(10) DEFAULT 'zh-CN',
    theme varchar(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (user_id)
);

-- =============================================
-- 2. 学习群组表 (优化版)
-- =============================================
CREATE TABLE study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    description text,
    creator_id uuid REFERENCES users(id),
    category varchar(50), -- 学习分类：编程、语言、考研等
    tags text[], -- 标签数组
    max_members integer DEFAULT 10,
    current_members integer DEFAULT 0,
    is_public boolean DEFAULT TRUE,
    join_approval_required boolean DEFAULT FALSE,
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    cover_image text, -- 群组封面图
    study_target text, -- 学习目标
    study_duration_days integer, -- 学习周期(天)
    difficulty_level varchar(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 群组统计表
CREATE TABLE group_statistics(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    total_checkins integer DEFAULT 0,
    total_messages integer DEFAULT 0,
    avg_daily_active_members decimal(5, 2) DEFAULT 0,
    last_activity_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (group_id)
);

-- =============================================
-- 3. 群组成员表 (优化版)
-- =============================================
CREATE TABLE group_members(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role varchar(20) DEFAULT 'member' CHECK (ROLE IN ('creator', 'admin', 'member')),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'muted', 'banned')),
    nickname varchar(50), -- 群内昵称
    join_reason text, -- 加入理由
    contribution_score integer DEFAULT 0, -- 贡献度
    joined_at timestamp with time zone DEFAULT NOW(),
    last_active_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

-- =============================================
-- 4. 打卡记录表 (优化版)
-- =============================================
CREATE TABLE checkin_records(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid REFERENCES study_groups(id) ON DELETE SET NULL, -- 可选：关联群组
    title varchar(100), -- 打卡标题
    content text NOT NULL,
    checkin_type varchar(20) DEFAULT 'daily' CHECK (checkin_type IN ('daily', 'milestone', 'reflection')),
    study_duration integer DEFAULT 0, -- 学习时长(分钟)
    mood varchar(20) CHECK (mood IN ('happy', 'motivated', 'tired', 'frustrated', 'accomplished')),
    images text[], -- 图片数组
    location jsonb, -- 地理位置信息
    tags text[], -- 标签
    is_public boolean DEFAULT TRUE,
    like_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    checkin_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (user_id, checkin_date, checkin_type)
);

-- 打卡点赞表
CREATE TABLE checkin_likes(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    checkin_id uuid REFERENCES checkin_records(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (checkin_id, user_id)
);

-- 打卡评论表
CREATE TABLE checkin_comments(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    checkin_id uuid REFERENCES checkin_records(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    parent_id uuid REFERENCES checkin_comments(id) ON DELETE CASCADE, -- 支持回复
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 5. AI聊天记录表 (优化版)
-- =============================================
CREATE TABLE chat_sessions(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    title varchar(100) DEFAULT '新对话',
    context_type varchar(20) DEFAULT 'general' CHECK (context_type IN ('general', 'study_help', 'motivation', 'planning')),
    total_messages integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE chat_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    message text NOT NULL,
    message_type varchar(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    ai_response text,
    response_time_ms integer, -- AI响应时间
    tokens_used integer, -- 使用的token数量
    created_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 6. 群组匹配系统 (优化版)
-- =============================================
CREATE TABLE user_interests(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    category varchar(50) NOT NULL, -- 兴趣分类
    subcategory varchar(50), -- 兴趣子分类
    level varchar(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    priority integer DEFAULT 1, -- 优先级 1-5
    created_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (user_id, category, subcategory)
);

CREATE TABLE match_requests(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    request_type varchar(20) DEFAULT 'group' CHECK (request_type IN ('group', 'partner', 'mentor')),
    interests text[] NOT NULL,
    study_goals text NOT NULL,
    preferred_schedule jsonb, -- 首选时间安排
    preferred_group_size integer DEFAULT 5,
    location_preference varchar(100),
    online_only boolean DEFAULT FALSE,
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'cancelled', 'expired')),
    matched_group_id uuid REFERENCES study_groups(id) ON DELETE SET NULL,
    expires_at timestamp with time zone DEFAULT (NOW() + interval '7 days'),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 7. 通知系统
-- =============================================
CREATE TABLE notifications(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    type varchar(50) NOT NULL, -- 通知类型
    title varchar(100) NOT NULL,
    content text,
    data jsonb, -- 额外数据
    is_read boolean DEFAULT FALSE,
    priority varchar(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 8. 系统配置表
-- =============================================
CREATE TABLE system_configs(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key varchar(100) UNIQUE NOT NULL,
    value jsonb NOT NULL,
    description text,
    is_public boolean DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 9. 创建索引优化查询性能
-- =============================================
CREATE INDEX idx_users_openid ON users(openid);

CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_study_groups_category ON study_groups(category);

CREATE INDEX idx_study_groups_status ON study_groups(status);

CREATE INDEX idx_study_groups_is_public ON study_groups(is_public);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);

CREATE INDEX idx_group_members_user_id ON group_members(user_id);

CREATE INDEX idx_group_members_role ON group_members(ROLE);

CREATE INDEX idx_checkin_records_user_id ON checkin_records(user_id);

CREATE INDEX idx_checkin_records_date ON checkin_records(checkin_date);

CREATE INDEX idx_checkin_records_group_id ON checkin_records(group_id);

CREATE INDEX idx_checkin_records_is_public ON checkin_records(is_public);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_notifications_type ON notifications(type);

-- =============================================
-- 10. Row Level Security (RLS) 策略
-- =============================================
-- 用户表 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_policy ON users
    FOR SELECT
        USING (TRUE);

-- 公开可读
CREATE POLICY users_update_policy ON users
    FOR UPDATE
        USING (auth.uid()::text = openid);

CREATE POLICY users_insert_policy ON users
    FOR INSERT
        WITH CHECK (auth.uid()::text = openid);

-- 用户设置表 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_settings_policy ON user_settings
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = auth.uid()::text));

-- 群组表 RLS
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_groups_select_policy ON study_groups
    FOR SELECT
        USING (is_public = TRUE
            OR creator_id IN (
                SELECT
                    id
                FROM
                    users
                WHERE
                    openid = auth.uid()::text)
                    OR id IN (
                        SELECT
                            group_id
                        FROM
                            group_members
                        WHERE
                            user_id IN (
                                SELECT
                                    id
                                FROM
                                    users
                                WHERE
                                    openid = auth.uid()::text)));

-- 群组成员表 RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY group_members_policy ON group_members
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = auth.uid()::text)
                OR group_id IN (
                    SELECT
                        group_id
                    FROM
                        group_members
                    WHERE
                        user_id IN (
                            SELECT
                                id
                            FROM
                                users
                            WHERE
                                openid = auth.uid()::text) AND ROLE IN ('creator', 'admin')));

-- 打卡记录表 RLS
ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY checkin_records_select_policy ON checkin_records
    FOR SELECT
        USING (is_public = TRUE
            OR user_id IN (
                SELECT
                    id
                FROM
                    users
                WHERE
                    openid = auth.uid()::text));

CREATE POLICY checkin_records_modify_policy ON checkin_records
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = auth.uid()::text));

-- 聊天记录表 RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_sessions_policy ON chat_sessions
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = auth.uid()::text));

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_messages_policy ON chat_messages
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = auth.uid()::text));

-- 通知表 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_policy ON notifications
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = auth.uid()::text));

-- =============================================
-- 11. 触发器：自动更新统计数据
-- =============================================
-- 更新用户总打卡天数
CREATE OR REPLACE FUNCTION update_user_checkin_stats()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE
            users
        SET
            total_checkin_days = total_checkin_days + 1,
            updated_at = NOW()
        WHERE
            id = NEW.user_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_checkin_stats
    AFTER INSERT ON checkin_records
    FOR EACH ROW
    EXECUTE FUNCTION update_user_checkin_stats();

-- 更新群组成员数
CREATE OR REPLACE FUNCTION update_group_member_count()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE
            study_groups
        SET
            current_members = current_members + 1,
            updated_at = NOW()
        WHERE
            id = NEW.group_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE
            study_groups
        SET
            current_members = current_members - 1,
            updated_at = NOW()
        WHERE
            id = OLD.group_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_member_count
    AFTER INSERT OR DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_group_member_count();

-- =============================================
-- 12. 初始化系统配置
-- =============================================
INSERT INTO system_configs(key, value, description, is_public)
    VALUES ('app_version', '"1.0.0"', '应用版本号', TRUE),
('maintenance_mode', 'false', '维护模式开关', FALSE),
('max_group_size', '20', '群组最大人数', TRUE),
('checkin_reward_points', '10', '打卡奖励积分', FALSE),
('ai_chat_enabled', 'true', 'AI聊天功能开关', TRUE),
('notification_enabled', 'true', '通知功能开关', TRUE);

