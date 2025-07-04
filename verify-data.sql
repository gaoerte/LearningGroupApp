-- 检查数据库中的数据
-- 运行这个查询来确认数据是否存在
-- 1. 检查用户表
SELECT
  'users' AS table_name,
  COUNT(*) AS count
FROM
  users;

-- 2. 检查群组表
SELECT
  'study_groups' AS table_name,
  COUNT(*) AS count
FROM
  study_groups;

-- 3. 检查消息表
SELECT
  'chat_messages' AS table_name,
  COUNT(*) AS count
FROM
  chat_messages;

-- 4. 显示所有消息
SELECT
  id,
  sender_name,
  content,
  group_id,
  sender_id
FROM
  chat_messages
ORDER BY
  id;

-- 5. 显示所有用户
SELECT
  id,
  openid,
  nickname
FROM
  users;

-- 6. 显示所有群组
SELECT
  id,
  name,
  creator_id
FROM
  study_groups;

