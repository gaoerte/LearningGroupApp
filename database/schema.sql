/**
 * Supabase 数据库表结构设计
 */
-- 用户表
CREATE TABLE users(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  openid varchar UNIQUE NOT NULL,
  nickname varchar(50),
  avatar_url text,
  bio text,
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  total_study_days integer DEFAULT 0,
  continuous_study_days integer DEFAULT 0,
  total_study_minutes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 学习群组表
CREATE TABLE study_groups(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  description text,
  creator_id uuid REFERENCES users(id),
  category varchar(50) DEFAULT 'general',
  tags text[] DEFAULT '{}',
  current_members integer DEFAULT 1,
  max_members integer DEFAULT 20,
  is_public boolean DEFAULT TRUE,
  require_approval boolean DEFAULT FALSE,
  study_goal text,
  target_duration_days integer DEFAULT 30,
  difficulty_level varchar(20) DEFAULT 'beginner',
  invite_code varchar(10) UNIQUE,
  status varchar(20) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 群组成员表
CREATE TABLE group_members(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role varchar(20) DEFAULT 'member', -- 'creator', 'admin', 'member'
  status varchar(20) DEFAULT 'active', -- 'active', 'pending', 'banned'
  join_message text,
  joined_at timestamp with time zone DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- 打卡记录表
CREATE TABLE checkin_records(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  content text,
  checkin_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT NOW(),
  UNIQUE (user_id, checkin_date)
);

-- AI聊天记录表
CREATE TABLE chat_messages(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  message text NOT NULL,
  ai_response text,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 群组匹配请求表
CREATE TABLE match_requests(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  interests text[], -- 兴趣数组
  study_goals text,
  status varchar DEFAULT 'pending', -- 'pending', 'matched', 'cancelled'
  created_at timestamp with time zone DEFAULT NOW()
);

-- RLS (Row Level Security) 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- 创建索引以提高查询性能
CREATE INDEX idx_users_openid ON users(openid);

CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_study_groups_creator_id ON study_groups(creator_id);

CREATE INDEX idx_study_groups_category ON study_groups(category);

CREATE INDEX idx_study_groups_is_public ON study_groups(is_public);

CREATE INDEX idx_study_groups_status ON study_groups(status);

CREATE INDEX idx_study_groups_invite_code ON study_groups(invite_code);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);

CREATE INDEX idx_group_members_user_id ON group_members(user_id);

CREATE INDEX idx_group_members_status ON group_members(status);

CREATE INDEX idx_checkin_records_user_id ON checkin_records(user_id);

CREATE INDEX idx_checkin_records_checkin_date ON checkin_records(checkin_date);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);

CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_match_requests_user_id ON match_requests(user_id);

CREATE INDEX idx_match_requests_status ON match_requests(status);

-- 创建基本的 RLS 策略（用于测试，生产环境需要更严格的策略）
CREATE POLICY "Allow all operations for testing" ON users
  FOR ALL
    USING (TRUE);

CREATE POLICY "Allow all operations for testing" ON study_groups
  FOR ALL
    USING (TRUE);

CREATE POLICY "Allow all operations for testing" ON group_members
  FOR ALL
    USING (TRUE);

CREATE POLICY "Allow all operations for testing" ON checkin_records
  FOR ALL
    USING (TRUE);

CREATE POLICY "Allow all operations for testing" ON chat_messages
  FOR ALL
    USING (TRUE);

CREATE POLICY "Allow all operations for testing" ON match_requests
  FOR ALL
    USING (TRUE);

