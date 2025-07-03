-- 学习小组App - 最小化测试数据库结构
-- 仅包含云函数测试需要的基础表
-- 注意：如果表已存在且结构不同，请先执行 reset_schema.sql
-- 1. 用户表 (测试 userSystemTest)
CREATE TABLE IF NOT EXISTS users(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    openid varchar(255) UNIQUE NOT NULL,
    nickname varchar(50),
    email varchar(100),
    avatar_url text,
    total_checkin_days integer DEFAULT 0,
    continuous_checkin_days integer DEFAULT 0,
    last_checkin_date date,
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 2. 学习群组表 (测试 groupSystemTest)
-- 重要：creator_id 是 varchar(255) 类型，不是 uuid，不设置外键约束
CREATE TABLE IF NOT EXISTS study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE, -- 直接在列定义中设置唯一约束
    description text,
    category varchar(50),
    creator_id varchar(255) NOT NULL, -- 存储 openid 字符串，无外键约束
    member_count integer DEFAULT 1,
    max_members integer DEFAULT 50,
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 3. 打卡记录表 (测试扩展功能)
CREATE TABLE IF NOT EXISTS checkin_records(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    study_duration integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);

CREATE INDEX IF NOT EXISTS idx_study_groups_creator ON study_groups(creator_id);

CREATE INDEX IF NOT EXISTS idx_checkin_user_date ON checkin_records(user_id, created_at);

-- 插入测试数据 (安全方式)
-- 先确保用户存在
INSERT INTO users(openid, nickname, email)
    VALUES ('system_test', '系统测试用户', 'test@system.local')
ON CONFLICT (openid)
    DO UPDATE SET
        nickname = EXCLUDED.nickname,
        email = EXCLUDED.email,
        updated_at = NOW();

-- 再插入群组，使用字符串 openid 作为 creator_id
INSERT INTO study_groups(name, description, category, creator_id)
    VALUES ('系统测试群', '用于系统功能测试的群组', 'system', 'system_test')
ON CONFLICT (name)
    DO UPDATE SET
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        creator_id = EXCLUDED.creator_id,
        updated_at = NOW();

