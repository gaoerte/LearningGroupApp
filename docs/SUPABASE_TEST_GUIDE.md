# Supabase 测试完整指南

## 🎯 测试目标

本测试套件旨在全面验证 uni-app 学习小组应用与 Supabase 数据库的集成，包括：
- 云函数代理连接测试
- 数据库表结构验证
- CRUD 操作完整性测试
- RLS (Row Level Security) 策略测试
- 数据一致性和性能测试

## 🚀 快速开始

### 1. 配置 Supabase 项目

#### 1.1 创建 Supabase 项目
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目或选择现有项目
3. 记录项目 URL 和 API Keys

#### 1.2 设置数据库
```sql
-- 在 Supabase SQL Editor 中执行以下脚本
-- 或者使用项目中的 database/schema.sql

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
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

-- 创建学习群组表
CREATE TABLE study_groups(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  description text,
  creator_id uuid REFERENCES users(id),
  category varchar(50) DEFAULT 'general',
  tags text[] DEFAULT '{}',
  current_members integer DEFAULT 1,
  max_members integer DEFAULT 20,
  is_public boolean DEFAULT true,
  require_approval boolean DEFAULT false,
  study_goal text,
  target_duration_days integer DEFAULT 30,
  difficulty_level varchar(20) DEFAULT 'beginner',
  invite_code varchar(10) UNIQUE,
  status varchar(20) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- 创建群组成员表
CREATE TABLE group_members(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role varchar(20) DEFAULT 'member',
  status varchar(20) DEFAULT 'active',
  join_message text,
  joined_at timestamp with time zone DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- 创建打卡记录表
CREATE TABLE checkin_records(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  content text,
  checkin_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT NOW(),
  UNIQUE (user_id, checkin_date)
);

-- 创建AI聊天记录表
CREATE TABLE chat_messages(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  message text NOT NULL,
  ai_response text,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 创建群组匹配请求表
CREATE TABLE match_requests(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  interests text[],
  study_goals text,
  status varchar DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT NOW()
);

-- 启用 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- 创建基本的 RLS 策略（允许所有操作，用于测试）
CREATE POLICY "Allow all for testing" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON study_groups FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON group_members FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON checkin_records FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all for testing" ON match_requests FOR ALL USING (true);
```

#### 1.3 配置环境变量
在云函数中设置环境变量：
```bash
# 在微信小程序云开发控制台中设置环境变量
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 2. 配置测试环境

#### 2.1 更新测试配置
编辑 `config/supabase-test.js`：
```javascript
const SUPABASE_TEST_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'your-anonymous-key',
  serviceKey: 'your-service-role-key'
  // ... 其他配置
};
```

#### 2.2 部署云函数
确保以下云函数已部署：
- `testProxy`: 基础连接测试
- `supabaseProxy`: Supabase 代理服务

## 📋 测试流程

### 1. 打开测试页面
在 HBuilderX 中：
1. 选择运行配置：`Supabase完整测试`
2. 或手动导航到：`pages/test/supabaseTestComplete`

### 2. 配置连接信息
在测试页面底部的"测试配置"部分：
1. 输入 Supabase URL
2. 输入 Anonymous Key
3. 点击"保存配置"

### 3. 运行测试

#### 快速测试（推荐首次使用）
1. 点击"运行快速测试"
2. 测试项目：
   - 云函数基础连接
   - Supabase 代理连接
   - 数据库表结构验证

#### 完整测试
1. 点击"运行完整测试"
2. 包含所有快速测试项目，plus：
   - 用户 CRUD 操作
   - 学习群组 CRUD 操作
   - 打卡记录操作
   - AI 聊天记录操作
   - 数据清理

#### 单项测试
根据需要选择特定的测试项目：
- 连接测试
- 表结构测试
- 用户操作测试
- 群组操作测试

## 🔍 测试结果分析

### 成功指标
- ✅ 连接状态显示"已连接"
- ✅ 所有表结构测试通过
- ✅ CRUD 操作成功创建、查询、更新数据
- ✅ 测试通过率 ≥ 90%

### 常见问题排查

#### 1. 连接失败
**症状**: 云函数连接或 Supabase 代理连接失败
**解决方案**:
```bash
# 检查云函数是否正确部署
# 在 HBuilderX 中右键点击 cloudfunctions 文件夹，选择"上传部署"

# 检查环境变量配置
# 在微信开发者工具 -> 云开发 -> 设置 -> 环境变量

# 检查网络连接
# 确保开发环境可以访问 Supabase 服务
```

#### 2. 表结构测试失败
**症状**: 数据库表访问失败
**解决方案**:
```sql
-- 检查表是否存在
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 检查 RLS 策略
SELECT * FROM pg_policies;

-- 重新创建测试策略
DROP POLICY IF EXISTS "Allow all for testing" ON users;
CREATE POLICY "Allow all for testing" ON users FOR ALL USING (true);
```

#### 3. CRUD 操作失败
**症状**: 数据创建、查询、更新失败
**解决方案**:
```javascript
// 检查数据格式
// 确保传入的数据符合数据库表结构

// 检查权限
// 确保 RLS 策略允许操作

// 检查外键约束
// 确保关联表的数据存在
```

#### 4. 权限错误
**症状**: 操作被拒绝，提示权限不足
**解决方案**:
```sql
-- 临时禁用 RLS 进行测试
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 或者创建更宽松的测试策略
CREATE POLICY "Test policy" ON users FOR ALL USING (true);
```

## 📊 性能基准

### 预期性能指标
- 连接建立时间: < 2秒
- 单表查询时间: < 500ms
- 数据插入时间: < 1秒
- 复杂查询时间: < 2秒

### 性能优化建议
1. **索引优化**: 为常用查询字段添加索引
2. **查询优化**: 使用合适的 WHERE 条件和 LIMIT
3. **连接池**: 配置合适的数据库连接池
4. **缓存策略**: 实现适当的数据缓存

## 🛠️ 高级测试

### 1. 压力测试
```javascript
// 并发用户创建测试
async function stressTestUserCreation() {
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(supabaseTester.testUserCRUD());
  }
  await Promise.all(promises);
}
```

### 2. 数据一致性测试
```javascript
// 测试并发操作的数据一致性
async function testDataConsistency() {
  // 同时创建用户和群组
  // 验证外键约束
  // 检查数据完整性
}
```

### 3. RLS 策略测试
```sql
-- 创建更严格的 RLS 策略进行测试
CREATE POLICY "User can only see own data" ON users 
FOR SELECT USING (openid = current_setting('user.openid'));
```

## 📝 测试报告

测试完成后，可以：
1. 查看详细的测试结果
2. 导出测试报告（复制到剪贴板）
3. 分析失败的测试项目
4. 生成性能分析报告

## 🧹 清理和维护

### 定期清理测试数据
```sql
-- 清理测试用户
DELETE FROM users WHERE openid LIKE 'test_%';

-- 清理测试群组
DELETE FROM study_groups WHERE name LIKE '测试%';

-- 重置序列（如果使用）
ALTER SEQUENCE users_id_seq RESTART WITH 1;
```

### 监控数据库健康
```sql
-- 检查表大小
SELECT schemaname,tablename,attname,n_distinct,correlation FROM pg_stats;

-- 检查索引使用情况
SELECT * FROM pg_stat_user_indexes;

-- 检查慢查询
SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC;
```

## 🔗 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [uni-app 云函数文档](https://uniapp.dcloud.net.cn/uniCloud/)
- [微信小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/)

## ❓ 支持与反馈

如果在测试过程中遇到问题：
1. 查看浏览器/开发者工具的控制台日志
2. 检查云函数的运行日志
3. 查看 Supabase Dashboard 的日志
4. 导出测试结果进行分析

---

*最后更新: 2024年1月*
