# Supabase 快速配置（5分钟完成）

## 🎯 配置目标
为您的学习小组应用配置 Supabase 数据库，实现用户管理、群组功能、打卡系统等。

## 📋 配置步骤

### 1️⃣ 创建 Supabase 项目
1. 访问 https://app.supabase.com
2. 注册/登录账户
3. 点击 "New Project"
4. 填写信息：
   - 项目名称：`LearningGroupApp`
   - 数据库密码：设置强密码（请记住）
   - 区域：选择离您最近的区域
5. 点击 "Create new project"，等待 2-3 分钟

### 2️⃣ 执行数据库脚本
1. 项目创建完成后，点击左侧 "SQL Editor"
2. 点击 "New Query"
3. 复制您的 `database/schema.sql` 文件内容并粘贴
4. 点击 "Run" 执行

### 3️⃣ 获取连接信息
1. 点击左侧 "Settings" → "API"
2. 记录以下信息：
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4️⃣ 配置云函数环境变量
在微信开发者工具的云开发控制台中：
1. 进入 "设置" → "环境变量"
2. 添加：
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=你的anon密钥
   ```

### 5️⃣ 部署云函数
1. 在 HBuilderX 中右键 `cloudfunctions` 文件夹
2. 选择 "上传部署"
3. 部署 `supabaseTest` 云函数

### 6️⃣ 测试连接
1. 在 HBuilderX 中选择运行："Supabase连接测试"
2. 填写您的 URL 和 API Key
3. 点击 "测试连接"

## ✅ 成功标志
- 连接状态显示 "已连接"
- 看到 6 个数据库表
- 测试通过率 100%

## 🆘 需要帮助？
如果遇到问题，请：
1. 检查 URL 和 Key 是否正确
2. 确认云函数已部署
3. 查看测试页面的错误信息
4. 参考详细配置指南：`docs/SUPABASE_SETUP_GUIDE.md`

---
*配置完成后，您就可以开始使用完整的数据库功能了！*
