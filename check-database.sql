-- 快速检查数据库状态
-- 复制并在 Supabase SQL Editor 中运行
-- 1. 检查表是否存在并统计记录数
SELECT
  'users' AS table_name,
  COUNT(*) AS count
FROM
  users
UNION ALL
SELECT
  'study_groups' AS table_name,
  COUNT(*) AS count
FROM
  study_groups
UNION ALL
SELECT
  'chat_messages' AS table_name,
  COUNT(*) AS count
FROM
  chat_messages;

-- 2. 显示所有消息（如果有的话）
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

-- 如果上面的查询显示 chat_messages 有 0 条记录，运行下面的插入语句：
/*
-- 3. 重新插入测试数据（如果需要）
INSERT INTO chat_messages(group_id, sender_id, sender_name, content)
VALUES 
 ((SELECT id FROM study_groups LIMIT 1), (SELECT id FROM users WHERE openid = 'test_001'), '测试用户', '这是测试消息 🎉'),
 ((SELECT id FROM study_groups LIMIT 1), (SELECT id FROM users WHERE openid = 'test_002'), 'AI助手', '测试连接成功！😊');
 */
