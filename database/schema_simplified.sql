/**
 * 学习小组App - 渐进式数据结构设计
 * 从基础功能开始，逐步扩展
 */
-- =============================================
-- 阶段一：核心用户和认证功能
-- =============================================
-- 1. 用户基础表
CREATE TABLE users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(255) UNIQUE NOT NULL,
    nickname varchar(50),
    avatar_url text,
    -- 基础统计
    total_checkin_days integer DEFAULT 0,
    continuous_checkin_days integer DEFAULT 0,
    last_checkin_date date,
    -- 系统字段
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 2. 简化的用户设置表
CREATE TABLE user_preferences(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    -- 基础设置
    notification_enabled boolean DEFAULT TRUE,
    reminder_time time DEFAULT '20:00:00',
    privacy_level varchar(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'private')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (user_id)
);

-- =============================================
-- 阶段二：打卡功能
-- =============================================
-- 3. 打卡记录表（简化版）
CREATE TABLE checkin_records(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    -- 打卡内容
    content text NOT NULL,
    mood varchar(20) CHECK (mood IN ('happy', 'motivated', 'tired', 'neutral', 'accomplished')),
    study_duration integer DEFAULT 0, -- 学习时长(分钟)
    -- 可选扩展字段
    images text[], -- 图片URL数组
    tags text[], -- 标签数组
    -- 社交功能
    is_public boolean DEFAULT TRUE,
    like_count integer DEFAULT 0,
    -- 时间字段
    checkin_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT NOW(),
    -- 确保每天只能打卡一次
    UNIQUE (user_id, checkin_date)
);

-- 4. 打卡点赞表
CREATE TABLE checkin_likes(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    checkin_id uuid REFERENCES checkin_records(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (checkin_id, user_id)
);

-- =============================================
-- 阶段三：学习群组功能
-- =============================================
-- 5. 学习群组表（简化版）
CREATE TABLE study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL,
    description text,
    creator_id uuid REFERENCES users(id),
    -- 基础设置
    max_members integer DEFAULT 10,
    current_members integer DEFAULT 1, -- 创建者自动加入
    is_public boolean DEFAULT TRUE,
    -- 分类
    category varchar(50), -- 如：编程、语言学习、考研等
    -- 状态
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 6. 群组成员表
CREATE TABLE group_members(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    -- 角色
    role varchar(20) DEFAULT 'member' CHECK (ROLE IN ('creator', 'admin', 'member')),
    -- 状态
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'left')),
    joined_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

-- =============================================
-- 阶段四：AI聊天功能
-- =============================================
-- 7. AI聊天记录表（简化版）
CREATE TABLE chat_messages(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    -- 消息内容
    user_message text NOT NULL,
    ai_response text,
    -- 聊天类型
    chat_type varchar(20) DEFAULT 'general' CHECK (chat_type IN ('general', 'study_help', 'motivation')),
    created_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 阶段五：匹配和推荐系统
-- =============================================
-- 8. 用户兴趣表
CREATE TABLE user_interests(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    interest_name varchar(50) NOT NULL,
    level varchar(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    created_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (user_id, interest_name)
);

-- 9. 群组匹配请求表
CREATE TABLE match_requests(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    -- 匹配需求
    interests text[] NOT NULL,
    study_goals text NOT NULL,
    preferred_group_size integer DEFAULT 5,
    -- 状态
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'cancelled')),
    matched_group_id uuid REFERENCES study_groups(id) ON DELETE SET NULL,
    -- 过期时间
    expires_at timestamp with time zone DEFAULT (NOW() + interval '7 days'),
    created_at timestamp with time zone DEFAULT NOW()
);

-- =============================================
-- 性能优化：创建必要的索引
-- =============================================
-- 用户表索引
CREATE INDEX idx_users_openid ON users(openid);

CREATE INDEX idx_users_status ON users(status);

-- 打卡记录索引
CREATE INDEX idx_checkin_user_date ON checkin_records(user_id, checkin_date);

CREATE INDEX idx_checkin_public ON checkin_records(is_public, created_at DESC)
WHERE
    is_public = TRUE;

-- 群组相关索引
CREATE INDEX idx_groups_category ON study_groups(category);

CREATE INDEX idx_groups_public ON study_groups(is_public, status)
WHERE
    is_public = TRUE AND status = 'active';

CREATE INDEX idx_group_members_group ON group_members(group_id, status);

CREATE INDEX idx_group_members_user ON group_members(user_id, status);

-- 聊天记录索引
CREATE INDEX idx_chat_user_time ON chat_messages(user_id, created_at DESC);

-- =============================================
-- Row Level Security (RLS) 策略
-- =============================================
-- 用户表 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 公开查看基础信息，只能更新自己的信息
CREATE POLICY users_select_policy ON users
    FOR SELECT
        USING (TRUE);

CREATE POLICY users_update_policy ON users
    FOR UPDATE
        USING (openid = current_setting('app.current_user_openid', TRUE));

CREATE POLICY users_insert_policy ON users
    FOR INSERT
        WITH CHECK (openid = current_setting('app.current_user_openid', TRUE));

-- 用户设置表 RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_policy ON user_preferences
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = current_setting('app.current_user_openid', TRUE)));

-- 打卡记录表 RLS
ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;

-- 可以查看公开的打卡记录，或者自己的记录
CREATE POLICY checkin_select_policy ON checkin_records
    FOR SELECT
        USING (is_public = TRUE
            OR user_id IN (
                SELECT
                    id
                FROM
                    users
                WHERE
                    openid = current_setting('app.current_user_openid', TRUE)));

-- 只能修改自己的打卡记录
CREATE POLICY checkin_modify_policy ON checkin_records
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = current_setting('app.current_user_openid', TRUE)));

-- 打卡点赞表 RLS
ALTER TABLE checkin_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY checkin_likes_policy ON checkin_likes
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = current_setting('app.current_user_openid', TRUE)));

-- 学习群组表 RLS
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

-- 可以查看公开群组，或自己参与的群组
CREATE POLICY groups_select_policy ON study_groups
    FOR SELECT
        USING (is_public = TRUE
            OR creator_id IN (
                SELECT
                    id
                FROM
                    users
                WHERE
                    openid = current_setting('app.current_user_openid', TRUE))
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
                                    openid = current_setting('app.current_user_openid', TRUE))));

-- 只有创建者可以修改群组
CREATE POLICY groups_modify_policy ON study_groups
    FOR UPDATE
        USING (creator_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = current_setting('app.current_user_openid', TRUE)));

-- 任何用户都可以创建群组
CREATE POLICY groups_insert_policy ON study_groups
    FOR INSERT
        WITH CHECK (creator_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = current_setting('app.current_user_openid', TRUE)));

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
                openid = current_setting('app.current_user_openid', TRUE))
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
                                openid = current_setting('app.current_user_openid', TRUE)) AND ROLE IN ('creator', 'admin')));

-- AI聊天记录表 RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_messages_policy ON chat_messages
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = current_setting('app.current_user_openid', TRUE)));

-- 用户兴趣表 RLS
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_interests_policy ON user_interests
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = current_setting('app.current_user_openid', TRUE)));

-- 匹配请求表 RLS
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY match_requests_policy ON match_requests
    FOR ALL
        USING (user_id IN (
            SELECT
                id
            FROM
                users
            WHERE
                openid = current_setting('app.current_user_openid', TRUE)));

-- =============================================
-- 触发器：自动更新统计数据
-- =============================================
-- 更新用户打卡统计
CREATE OR REPLACE FUNCTION update_user_checkin_stats()
    RETURNS TRIGGER
    AS $$
DECLARE
    last_date date;
    continuous_days integer;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 获取用户上次打卡日期
        SELECT
            last_checkin_date INTO last_date
        FROM
            users
        WHERE
            id = NEW.user_id;
        -- 计算连续打卡天数
        IF last_date IS NULL THEN
            continuous_days := 1;
        ELSIF NEW.checkin_date = last_date + 1 THEN
            SELECT
                continuous_checkin_days + 1 INTO continuous_days
            FROM
                users
            WHERE
                id = NEW.user_id;
        ELSE
            continuous_days := 1;
        END IF;
        -- 更新用户统计
        UPDATE
            users
        SET
            total_checkin_days = total_checkin_days + 1,
            continuous_checkin_days = continuous_days,
            last_checkin_date = NEW.checkin_date,
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
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE
            study_groups
        SET
            current_members = current_members + 1,
            updated_at = NOW()
        WHERE
            id = NEW.group_id;
    ELSIF TG_OP = 'UPDATE'
            AND OLD.status = 'active'
            AND NEW.status = 'left' THEN
            UPDATE
                study_groups
            SET
                current_members = current_members - 1,
                updated_at = NOW()
            WHERE
                id = NEW.group_id;
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
            like_count = like_count + 1
        WHERE
            id = NEW.checkin_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE
            checkin_records
        SET
            like_count = like_count - 1
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

-- =============================================
-- 初始化数据
-- =============================================
-- 插入一些示例学习分类
-- （实际使用时可以通过管理界面添加）
-- 这里我们先用简单的方式处理
-- 创建一个视图来获取所有可用的学习分类
CREATE VIEW available_categories AS SELECT DISTINCT
    category
FROM
    study_groups
WHERE
    category IS NOT NULL
    AND status = 'active'
UNION
SELECT
    unnest(ARRAY['编程开发', '语言学习', '考研考证', '设计创意', '数据分析', '产品运营']) AS category;

