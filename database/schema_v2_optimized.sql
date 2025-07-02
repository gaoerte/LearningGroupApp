-- =============================================
-- 学习小组应用 - 重新优化的数据库结构
-- 设计原则：简洁、高效、可扩展
-- 时间：2025.7.2
-- =============================================
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. 用户表 (核心表)
-- =============================================
CREATE TABLE users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar UNIQUE NOT NULL, -- 微信 openid
    nickname varchar(50) NOT NULL DEFAULT '新用户',
    avatar_url text,
    phone varchar(20),
    email varchar(100),
    gender varchar(10) CHECK (gender IN ('male', 'female', 'unknown')) DEFAULT 'unknown',
    birth_date date,
    location varchar(100),
    bio text,
    -- 学习统计
    total_study_days integer DEFAULT 0,
    continuous_study_days integer DEFAULT 0,
    total_study_minutes integer DEFAULT 0,
    level integer DEFAULT 1,
    experience_points integer DEFAULT 0,
    -- 系统字段
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    last_login_at timestamp with time zone DEFAULT NOW(),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 用户偏好设置表
CREATE TABLE user_preferences(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    -- 通知设置
    push_notifications boolean DEFAULT TRUE,
    reminder_time time DEFAULT '20:00:00',
    reminder_days text[] DEFAULT '{"monday","tuesday","wednesday","thursday","friday","saturday","sunday"}',
    -- 隐私设置
    profile_visibility varchar(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    checkin_visibility varchar(20) DEFAULT 'public' CHECK (checkin_visibility IN ('public', 'friends', 'private')),
    -- 应用设置
    theme varchar(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language varchar
(10) DEFAULT 'zh-CN',
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (user_id)
);

-- =============================================
-- 2. 兴趣标签表 (用于推荐)
-- =============================================
CREATE TABLE interest_tags(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(50) UNIQUE NOT NULL,
    category varchar(30) NOT NULL, -- 大分类：编程、语言、考试等
    color varchar(7) DEFAULT '#3B82F6', -- 标签颜色
    icon varchar(50), -- 图标名称
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT TRUE,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 用户兴趣关联表
CREATE TABLE user_interests(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES interest_tags(id) ON DELETE CASCADE,
    proficiency_level varchar(20) DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
    interest_score integer DEFAULT 50, -- 兴趣度评分 0-100
    created_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (user_id, tag_id)
);

-- =============================================
-- 3. 学习群组表 (简化优化)
-- =============================================
CREATE TABLE study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    description text,
    creator_id uuid REFERENCES users(id) ON DELETE SET NULL,
    -- 群组设置
    category varchar(50) NOT NULL, -- 主分类
    tags text[] DEFAULT '{}', -- 相关标签
    max_members integer DEFAULT 20,
    current_members integer DEFAULT 1,
    is_public boolean DEFAULT TRUE,
    require_approval boolean DEFAULT FALSE,
    -- 群组状态
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    cover_image text,
    invite_code varchar(8) UNIQUE, -- 邀请码
    -- 学习目标
    study_goal text,
    target_duration_days integer DEFAULT 30,
    difficulty_level varchar(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    -- 统计字段
    total_checkins integer DEFAULT 0,
    total_messages integer DEFAULT 0,
    last_activity_at timestamp with time zone DEFAULT NOW(),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 群组成员表
CREATE TABLE group_members(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role varchar(20) DEFAULT 'member' CHECK (ROLE IN ('creator', 'admin', 'member')),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'muted', 'left', 'banned')),
    -- 群内信息
    group_nickname varchar(50), -- 群内昵称
    join_message text, -- 加入申请信息
    -- 统计信息
    message_count integer DEFAULT 0,
    checkin_count integer DEFAULT 0,
    contribution_score integer DEFAULT 0,
    joined_at timestamp with time zone DEFAULT NOW(),
    last_active_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

-- =============================================
-- 4. 打卡记录表 (核心功能)
-- =============================================
CREATE TABLE checkin_records(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid REFERENCES study_groups(id) ON DELETE SET NULL, -- 可选关联群组
    -- 打卡内容
    title varchar(100),
    content text NOT NULL,
    study_minutes integer DEFAULT 0, -- 本次学习时长
    -- 打卡类型和心情
    checkin_type varchar(20) DEFAULT 'daily' CHECK (checkin_type IN ('daily', 'milestone', 'summary')),
    mood varchar(20) CHECK (mood IN ('excited', 'happy', 'normal', 'tired', 'struggling')),
    -- 媒体内容
    images text[] DEFAULT '{}',
    -- 标签和分类
    tags text[] DEFAULT '{}',
    category varchar(50),
    -- 互动统计
    like_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    -- 可见性
    visibility varchar(20) DEFAULT 'public' CHECK (visibility IN ('public', 'group', 'private')),
    -- 时间信息
    checkin_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
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
    parent_id uuid REFERENCES checkin_comments(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 5. 群组聊天表 (实时通信)
-- =============================================
CREATE TABLE group_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    -- 消息内容
    content text NOT NULL,
    message_type varchar(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'checkin_share', 'system')),
    -- 消息元数据
    reply_to_id uuid REFERENCES group_messages(id) ON DELETE SET NULL,
    mentioned_users uuid[] DEFAULT '{}',
    -- 系统字段
    is_deleted boolean DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 6. AI助手会话表 (智能功能)
-- =============================================
CREATE TABLE ai_chat_sessions(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    title varchar(100) DEFAULT '学习助手对话',
    session_type varchar(30) DEFAULT 'general' CHECK (session_type IN ('general', 'study_plan', 'motivation', 'qa')),
    context_data jsonb DEFAULT '{}', -- 上下文信息
    message_count integer DEFAULT 0,
    last_message_at timestamp with time zone DEFAULT NOW(),
    created_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE ai_chat_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role varchar(10) NOT NULL CHECK (ROLE IN ('user', 'assistant')),
    content text NOT NULL,
    -- AI 响应元数据
    response_time_ms integer, -- 响应时间
    token_count integer, -- token使用量
    created_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 7. 系统通知表
-- =============================================
CREATE TABLE notifications(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    title varchar(100) NOT NULL,
    content text NOT NULL,
    notification_type varchar(30) NOT NULL CHECK (notification_type IN ('system', 'group_invite', 'like', 'comment', 'achievement')),
    -- 关联数据
    related_id uuid, -- 关联的资源ID
    related_type varchar(30), -- 关联的资源类型
    -- 状态
    is_read boolean DEFAULT FALSE,
    action_url text, -- 点击跳转的URL
    created_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 8. 索引优化
-- =============================================
-- 用户相关索引
CREATE INDEX idx_users_openid ON users(openid);

CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_users_last_login ON users(last_login_at);

-- 群组相关索引
CREATE INDEX idx_study_groups_category ON study_groups(category);

CREATE INDEX idx_study_groups_status ON study_groups(status);

CREATE INDEX idx_study_groups_public ON study_groups(is_public);

CREATE INDEX idx_group_members_user ON group_members(user_id);

CREATE INDEX idx_group_members_group ON group_members(group_id);

-- 打卡相关索引
CREATE INDEX idx_checkin_user_date ON checkin_records(user_id, checkin_date);

CREATE INDEX idx_checkin_group ON checkin_records(group_id);

CREATE INDEX idx_checkin_visibility ON checkin_records(visibility);

CREATE INDEX idx_checkin_created ON checkin_records(created_at);

-- 消息相关索引
CREATE INDEX idx_group_messages_group ON group_messages(group_id, created_at);

CREATE INDEX idx_ai_messages_session ON ai_chat_messages(session_id, created_at);

-- 通知索引
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- =============================================
-- 9. 触发器函数 (自动更新统计)
-- =============================================
-- 更新群组成员数量
CREATE OR REPLACE FUNCTION update_group_member_count()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE
            study_groups
        SET
            current_members = current_members + 1,
            updated_at = NOW()
        WHERE
            id = NEW.group_id;
    ELSIF TG_OP = 'UPDATE'
            AND OLD.status != NEW.status THEN
            IF NEW.status = 'active' AND OLD.status != 'active' THEN
                UPDATE
                    study_groups
                SET
                    current_members = current_members + 1,
                    updated_at = NOW()
                WHERE
                    id = NEW.group_id;
            ELSIF NEW.status != 'active'
                    AND OLD.status = 'active' THEN
                    UPDATE
                        study_groups
                    SET
                        current_members = current_members - 1,
                        updated_at = NOW()
                    WHERE
                        id = NEW.group_id;
            END IF;
    ELSIF TG_OP = 'DELETE'
            AND OLD.status = 'active' THEN
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
    AFTER INSERT OR UPDATE OR DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_group_member_count();

-- 更新打卡点赞数
CREATE OR REPLACE FUNCTION update_checkin_like_count()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE
            checkin_records
        SET
            like_count = like_count + 1,
            updated_at = NOW()
        WHERE
            id = NEW.checkin_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE
            checkin_records
        SET
            like_count = like_count - 1,
            updated_at = NOW()
        WHERE
            id = OLD.checkin_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checkin_like_count
    AFTER INSERT OR DELETE ON checkin_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_checkin_like_count();

-- 更新打卡评论数
CREATE OR REPLACE FUNCTION update_checkin_comment_count()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE
            checkin_records
        SET
            comment_count = comment_count + 1,
            updated_at = NOW()
        WHERE
            id = NEW.checkin_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE
            checkin_records
        SET
            comment_count = comment_count - 1,
            updated_at = NOW()
        WHERE
            id = OLD.checkin_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checkin_comment_count
    AFTER INSERT OR DELETE ON checkin_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_checkin_comment_count();

-- =============================================
-- 10. 初始化数据
-- =============================================
-- 插入默认兴趣标签
INSERT INTO interest_tags(name, category, color, icon)
    VALUES ('编程基础', '编程技术', '#3B82F6', '💻'),
('Web前端', '编程技术', '#10B981', '🌐'),
('Python', '编程技术', '#F59E0B', '🐍'),
('Java', '编程技术', '#EF4444', '☕'),
('JavaScript', '编程技术', '#8B5CF6', '⚡'),
('英语口语', '语言学习', '#06B6D4', '🗣️'),
('日语学习', '语言学习', '#EC4899', '🇯🇵'),
('韩语学习', '语言学习', '#84CC16', '🇰🇷'),
('考研数学', '考试备考', '#F97316', '🔢'),
('考研英语', '考试备考', '#6366F1', '📖'),
('四六级', '考试备考', '#14B8A6', '📝'),
('数据分析', '职业技能', '#9333EA', '📊'),
('产品设计', '职业技能', '#F43F5E', '🎨'),
('市场营销', '职业技能', '#22C55E', '📈');

-- 完成数据库初始化
COMMENT ON DATABASE postgres IS '学习小组应用数据库 - 已优化';

