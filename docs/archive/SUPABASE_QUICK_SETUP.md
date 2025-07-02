# Supabase 测试快速设置指南

## 🚀 5分钟快速开始

### 1. 创建 Supabase 项目
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息，等待创建完成

### 2. 获取连接信息
在项目 Dashboard 中：
1. 进入 `Settings` → `API`
2. 复制 `Project URL`
3. 复制 `anon public` key

### 3. 创建数据库表
在 `SQL Editor` 中执行：
```sql
-- 创建用户表
CREATE TABLE users(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  openid varchar UNIQUE NOT NULL,
  nickname varchar(50),
  avatar_url text,
  bio text,
  level integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 启用 RLS 并创建允许所有操作的策略（仅用于测试）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for testing" ON users FOR ALL USING (true);
```

### 4. 配置云函数环境变量
在微信开发者工具 → 云开发 → 设置 → 环境变量中添加：
```
SUPABASE_URL=你的项目URL
SUPABASE_ANON_KEY=你的匿名密钥
```

### 5. 部署云函数
在 HBuilderX 中：
1. 右键点击 `cloudfunctions` 文件夹
2. 选择 "上传部署"
3. 部署 `supabaseTest` 云函数

### 6. 运行测试
1. 在 HBuilderX 中选择运行配置："Supabase连接测试"
2. 或手动导航到测试页面
3. 填写 Supabase URL 和 Anonymous Key
4. 点击"测试连接"

## 🔧 测试页面介绍

### 简化测试页面 (推荐)
- **页面**: `pages/test/supabaseTestSimple.vue`
- **功能**: 基础连接测试、表结构验证、简单 CRUD 测试
- **适用**: 快速验证连接是否正常

### 完整测试页面
- **页面**: `pages/test/supabaseTestComplete.vue`
- **功能**: 全面的测试套件，包括性能测试、数据一致性测试等
- **适用**: 深度测试和性能分析

### 云函数测试页面
- **页面**: `pages/test/cloudFunctionTest.vue`
- **功能**: 测试云函数连接，不依赖 Supabase
- **适用**: 排查云函数相关问题

## 🎯 快速测试流程

1. **连接测试**: 验证基础连接是否正常
2. **表结构测试**: 检查数据库表是否可访问
3. **完整测试**: 运行 CRUD 操作，验证功能完整性

## ❓ 常见问题

### Q: 连接失败怎么办？
A: 检查以下几点：
- Supabase URL 格式是否正确 (https://xxx.supabase.co)
- Anonymous Key 是否正确
- 云函数是否已部署
- 网络连接是否正常

### Q: 表结构测试失败？
A: 确认：
- 数据库表是否已创建
- RLS 策略是否正确配置
- API Key 是否有足够权限

### Q: CRUD 操作失败？
A: 检查：
- 表结构是否与代码匹配
- 必填字段是否都有值
- 数据类型是否正确

## 📞 获取帮助

如果遇到问题：
1. 查看浏览器控制台日志
2. 查看微信开发者工具云函数日志
3. 查看 Supabase Dashboard 日志面板
4. 导出测试结果进行分析

---

*配置完成后，您就可以开始使用完整的 Supabase 数据库功能了！*
