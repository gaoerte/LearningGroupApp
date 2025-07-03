-- 学习小组App - 数据库结构重置脚本
-- 完全重置并重新创建所有表结构
-- 删除现有表（如果存在）
DROP TABLE IF EXISTS checkin_records CASCADE;

DROP TABLE IF EXISTS study_groups CASCADE;

DROP TABLE IF EXISTS users CASCADE;

-- 1. 用户表 (测试 userSystemTest)
CREATE TABLE users(
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
-- 注意：creator_id 明确为 varchar(255)，不设置外键约束
CREATE TABLE study_groups(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE, -- 直接在列定义中添加唯一约束
    description text,
    category varchar(50),
    creator_id varchar(255), -- 存储 openid 字符串，无外键约束
    member_count integer DEFAULT 1,
    max_members integer DEFAULT 50,
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 3. 打卡记录表 (测试扩展功能)
CREATE TABLE checkin_records(
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    study_duration integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_openid ON users(openid);

CREATE INDEX idx_study_groups_creator ON study_groups(creator_id);

CREATE INDEX idx_checkin_user_date ON checkin_records(user_id, created_at);

-- 插入测试数据
-- 先插入用户
INSERT INTO users(openid, nickname, email)
    VALUES ('system_test', '系统测试用户', 'test@system.local');

-- 再插入群组，creator_id 使用字符串 openid
INSERT INTO study_groups(name, description, category, creator_id)
    VALUES ('系统测试群', '用于系统功能测试的群组', 'system', 'system_test');

-- 验证数据插入
SELECT
    'users表记录数：' AS info,
    count(*) AS count
FROM
    users
UNION ALL
SELECT
    'study_groups表记录数：' AS info,
    count(*) AS count
FROM
    study_groups;

