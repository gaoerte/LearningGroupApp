/**
 * Supabase 数据库表结构设计
 */
-- 用户表
CREATE TABLE users(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  openid varchar UNIQUE NOT NULL,
  nickname varchar,
  avatar_url text,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 学习群组表
CREATE TABLE study_groups(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  description text,
  creator_id uuid REFERENCES users(id),
  max_members integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 群组成员表
CREATE TABLE group_members(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR DEFAULT 'member', -- 'admin', 'member'
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

