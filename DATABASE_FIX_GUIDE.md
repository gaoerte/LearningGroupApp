# 数据库表结构冲突解决方案

## 🔍 问题分析

错误信息 `ERROR: 22P02: invalid input syntax for type uuid: "system_test"` 表明：

1. **当前问题**：数据库中已存在 `study_groups` 表，但其 `creator_id` 字段可能是 `uuid` 类型或有外键约束
2. **插入冲突**：尝试插入字符串 `'system_test'` 到 uuid 类型字段导致类型错误

## 🔧 解决方案

### 方案一：完全重置表结构（推荐）

在 Supabase SQL Editor 中执行 `reset_schema.sql`：

```sql
-- 删除所有表并重新创建
-- 确保 creator_id 是 varchar(255) 类型，无外键约束
```

**操作步骤：**
1. 打开 Supabase 控制台：https://klpseujbhwvifsfshfdx.supabase.co
2. 进入 SQL Editor
3. 复制并执行 `database/reset_schema.sql` 的全部内容
4. 确认执行成功，看到插入的测试数据

### 方案二：检查并修复现有表结构

先检查当前表结构：

```sql
-- 检查表结构
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'study_groups' 
AND column_name = 'creator_id';

-- 检查外键约束
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'study_groups';
```

如果发现问题，手动修复：

```sql
-- 删除外键约束（如果存在）
ALTER TABLE study_groups DROP CONSTRAINT IF EXISTS study_groups_creator_id_fkey;

-- 修改字段类型为 varchar(255)
ALTER TABLE study_groups ALTER COLUMN creator_id TYPE varchar(255);
```

### 方案三：使用临时 UUID（不推荐）

如果必须保持现有结构：

```sql
-- 先获取 system_test 用户的 uuid
SELECT id FROM users WHERE openid = 'system_test';

-- 使用实际的 uuid 插入群组
INSERT INTO study_groups(name, description, category, creator_id)
VALUES ('系统测试群', '用于系统功能测试的群组', 'system', 
    (SELECT id FROM users WHERE openid = 'system_test')::text);
```

## 📝 最终验证

执行以下 SQL 确认修复成功：

```sql
-- 验证表结构
\d study_groups;

-- 验证数据插入
SELECT u.openid, sg.name, sg.creator_id
FROM users u
JOIN study_groups sg ON u.openid = sg.creator_id
WHERE u.openid = 'system_test';

-- 验证记录数
SELECT 'users' as table_name, count(*) FROM users
UNION ALL
SELECT 'study_groups' as table_name, count(*) FROM study_groups;
```

## 💡 预防措施

1. **字段类型一致**：确保 `creator_id` 始终为 `varchar(255)`
2. **无外键约束**：`creator_id` 存储字符串 openid，不设置外键
3. **明确注释**：在表定义中添加清晰的注释说明
4. **测试优先**：先在测试环境验证表结构

## 🎯 推荐操作

**立即执行方案一**：
1. 复制 `database/reset_schema.sql` 内容
2. 在 Supabase SQL Editor 中执行
3. 验证插入的测试数据
4. 在小程序中运行数据库测试

这样可以确保表结构完全正确，避免后续类型冲突问题。
